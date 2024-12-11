// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EHRManagement is ReentrancyGuard {
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
    mapping(address => mapping(uint256 => address)) private s_patientFiles;
    mapping(address => mapping(uint256 => File)) private s_addressToFiles;
    mapping(address => mapping(uint256 => mapping(address => bool)))
        private s_authorize;
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
    ) public view onlyPatients returns (File memory) {
        if (s_authorize[_granter][_fileCounter][msg.sender] != true) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        if (s_paid[msg.sender][_granter][_fileCounter] != true) {
            revert EHRManagement__PaymentNotFound(msg.sender);
        }
        return s_addressToFiles[_granter][_fileCounter];
    }
}
