// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {console, Test} from "forge-std/Test.sol";

contract EHRManagement is ReentrancyGuard, Test {
    /*//////////////////////////////////////////////////////////////
                              DECLARATION
    //////////////////////////////////////////////////////////////*/
    struct File {
        string file;
        uint256 fee;
    }
    enum Role {
        DOCTOR,
        PATIENT
    }

    /*//////////////////////////////////////////////////////////////
                             STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    mapping(address => Role) private s_roles;
    mapping(address => uint256) private s_fileCounter;

    //[Consumer] > [fileId] > [ProviderAddress] address(patient) --> address(doctor)
    mapping(address => mapping(uint256 => address)) private s_patientFiles;

    // [uploader] > [fileId] > File
    mapping(address => mapping(uint256 => File)) private s_addressToFiles;

    // [granter] > [fileId] > [consumer] > bool
    mapping(address => mapping(uint256 => mapping(address => bool)))
        private s_authorize;
    // [Consumer] > [Granter] > [file_id] > bool
    mapping(address => mapping(address => mapping(uint256 => bool)))
        private s_paid;

    /*//////////////////////////////////////////////////////////////
                            ERRORS & EVENTS
    //////////////////////////////////////////////////////////////*/

    error EHRManagement__RolePermissionDenied(Role authorizedRole);
    error EHRManagement__PermissionDenied(address unAuthorizedAddress);
    error EHRManagement__InsufficientPayment(
        uint256 requiredBalance,
        uint256 submittedBalance
    );
    error EHRManagement__PaymentNotFound(address patientAddress);
    error EHRManagement__PaymentError(address doctorAddress);
    error EHRManagement__AlreadyRegisteredAsDoctor();
    error EHRManagement__AlreadyRegisteredAsPatient();
    error EHRManagement__FileNotFound();

    event PermissionGranted(
        address indexed _to,
        address indexed _from,
        uint256 indexed fileId
    );
    event FileUploaded(
        address indexed doctor,
        uint256 indexed fileId,
        string ipfsHash,
        uint256 fee
    );
    event PaymentReceived(
        address indexed doctor,
        address indexed patient,
        uint256 amount
    );
    event RoleAssigned(address indexed user, Role indexed role);

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyDoctor() {
        if (s_roles[msg.sender] != Role.DOCTOR) {
            revert EHRManagement__RolePermissionDenied(Role.DOCTOR);
        }
        _;
    }

    modifier onlyPatients() {
        if (s_roles[msg.sender] != Role.PATIENT) {
            revert EHRManagement__RolePermissionDenied(Role.PATIENT);
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function registerUserAsDoctor() public {
        console.log(
            "Current role before registration:",
            uint(s_roles[msg.sender])
        );
        console.log("Address trying to register:", msg.sender);
        if (s_roles[msg.sender] == Role.DOCTOR) {
            revert EHRManagement__AlreadyRegisteredAsDoctor();
        }
        s_roles[msg.sender] = Role.DOCTOR;
        emit RoleAssigned(msg.sender, Role.DOCTOR);
    }

    function registerUserAsPatient() public {
        if (s_roles[msg.sender] == Role.PATIENT) {
            revert EHRManagement__AlreadyRegisteredAsPatient();
        }
        s_roles[msg.sender] = Role.PATIENT;
        emit RoleAssigned(msg.sender, Role.PATIENT);
    }

    function grantAccess(address _user, uint256 _fileCounter) public {
        File memory file = s_addressToFiles[msg.sender][_fileCounter];
        console.log("file", file.file);
        if (bytes(file.file).length == 0) {
            revert EHRManagement__FileNotFound();
        }
        s_authorize[msg.sender][_fileCounter][_user] = true;
        emit PermissionGranted(_user, msg.sender, _fileCounter);
    }

    function uploadReport(
        string memory _ipfsHash,
        uint256 _fee
    ) public onlyDoctor {
        uint256 fileCounter = s_fileCounter[msg.sender];
        File memory newFile = File({file: _ipfsHash, fee: _fee});
        s_addressToFiles[msg.sender][fileCounter] = newFile;
        console.log(
            "uploadReport file: ",
            s_addressToFiles[msg.sender][fileCounter].file,
            "fileCounter: ",
            fileCounter
        );
        emit FileUploaded(msg.sender, fileCounter, _ipfsHash, _fee);
        s_fileCounter[msg.sender]++;
    }

    function buyReport(
        address _doctor,
        uint256 _fileCounter
    ) public payable onlyPatients nonReentrant {
        if (s_roles[_doctor] != Role.DOCTOR) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        if (!s_authorize[_doctor][_fileCounter][msg.sender]) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        File memory file = s_addressToFiles[_doctor][_fileCounter];
        if (file.fee > msg.value) {
            revert EHRManagement__InsufficientPayment(file.fee, msg.value);
        }

        (bool sent, ) = payable(_doctor).call{value: msg.value}("");
        if (!sent) {
            revert EHRManagement__PaymentError(_doctor);
        }

        s_paid[msg.sender][_doctor][_fileCounter] = true;
        assignFileToPatients(_doctor);

        emit PaymentReceived(_doctor, msg.sender, msg.value);
    }

    function assignFileToPatients(address _doctor) public onlyPatients {
        uint256 fileCounter = s_fileCounter[msg.sender];
        s_patientFiles[msg.sender][fileCounter] = _doctor;
        s_fileCounter[msg.sender]++;
    }

    function viewReport(
        address _granter,
        uint256 _fileCounter
    ) public view returns (File memory) {
        if (s_authorize[_granter][_fileCounter][msg.sender] != true) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        if (s_paid[msg.sender][_granter][_fileCounter] != true) {
            revert EHRManagement__PaymentNotFound(msg.sender);
        }
        return s_addressToFiles[_granter][_fileCounter];
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/
    function getRoles(address user) public view returns (Role) {
        return s_roles[user];
    }

    function getFile(
        address user,
        uint256 fileCounter
    ) public view returns (string memory, uint256) {
        File memory file = s_addressToFiles[user][fileCounter];
        return (file.file, file.fee);
    }

    function getAutorizationStatus(
        address granter,
        uint256 fileid,
        address consumer
    ) public view returns (bool) {
        return s_authorize[granter][fileid][consumer];
    }

    function getPaymentStatus(
        address consumer,
        address granter,
        uint256 fileId
    ) public view returns (bool) {
        return s_paid[consumer][granter][fileId];
    }
}
