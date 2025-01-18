// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {AggregatorV3Interface} from "@chainlink/contracts/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {PriceConverter} from "./PriceConverter.sol";

contract EHRManagement {
    using PriceConverter for uint256;

    // Roles
    enum Role {
        NONE,
        PATIENT,
        DOCTOR
    }

    struct File {
        string fileHash;
        string fileName;
        uint256 fileId;
        uint256 fee;
    }

    struct FileAccess {
        bool authorized;
        bool paid;
    }

    // Mappings
    mapping(address => Role) private s_roles;
    mapping(address => File[]) private s_addressToFiles; // Now an array of files for each address
    //uploader -> fileID -> grantee -> FileAccess
    mapping(address => mapping(uint256 => mapping(address => FileAccess)))
        private s_access;

    // Global counter for unique file IDs
    AggregatorV3Interface private s_priceFeed;

    // Events
    event RoleAssigned(address indexed user, Role role);
    event FileUploaded(
        address indexed uploader,
        uint256 indexed fileId,
        string fileHash,
        uint256 fee
    );
    event AccessGranted(
        address indexed granter,
        address indexed grantee,
        uint256 indexed fileId
    );
    event AccessRevoked(
        address indexed granter,
        address indexed grantee,
        uint256 indexed fileId
    );
    event PaymentReceived(
        address indexed patient,
        address indexed doctor,
        uint256 indexed fileId,
        uint256 amount
    );

    // Custom errors
    error EHRManagement__PermissionDenied(address user);
    error EHRManagement__FileNotFound(uint256 fileId, address owner);
    error EHRManagement__RoleAlreadyAssigned(address user, Role role);
    error EHRManagement__InsufficientPayment(
        uint256 required,
        uint256 provided
    );

    // Modifiers
    modifier onlyDoctor() {
        if (s_roles[msg.sender] != Role.DOCTOR) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        _;
    }

    modifier onlyPatient() {
        if (s_roles[msg.sender] != Role.PATIENT) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        _;
    }

    modifier validRole() {
        if (s_roles[msg.sender] == Role.NONE) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        _;
    }

    constructor(address _priceFeed) {
        s_priceFeed = AggregatorV3Interface(_priceFeed);
    }

    // Role assignment
    function assignRole(address _user, Role _role) external {
        if (s_roles[_user] != Role.NONE) {
            revert EHRManagement__RoleAlreadyAssigned(_user, s_roles[_user]);
        }
        s_roles[_user] = _role;
        emit RoleAssigned(_user, _role);
    }

    // Upload a medical report
    function uploadReport(
        string memory _ipfsHash,
        string memory _name,
        uint256 _fee
    ) external validRole {
        uint256 newFileId = s_addressToFiles[msg.sender].length;
        //setting price in USD
        s_addressToFiles[msg.sender].push(
            File({
                fileHash: _ipfsHash,
                fileName: _name,
                fileId: newFileId,
                fee: _fee * 1e18
            })
        );
        emit FileUploaded(msg.sender, newFileId, _ipfsHash, _fee * 1e18);
    }

    // Grant access to a file
    function grantAccess(address _grantee, uint256 _fileId) external validRole {
        if (_fileId >= s_addressToFiles[msg.sender].length) {
            revert EHRManagement__FileNotFound(_fileId, msg.sender);
        }
        s_access[msg.sender][_fileId][_grantee] = FileAccess({
            authorized: true,
            paid: false
        });
        emit AccessGranted(msg.sender, _grantee, _fileId);
    }

    // Revoke access to a file
    function revokeAccess(
        address _grantee,
        uint256 _fileId
    ) external validRole {
        if (!s_access[msg.sender][_fileId][_grantee].authorized) {
            revert EHRManagement__PermissionDenied(_grantee);
        }
        delete s_access[msg.sender][_fileId][_grantee];
        emit AccessRevoked(msg.sender, _grantee, _fileId);
    }

    // Pay for access
    function payForAccess(
        address _doctor,
        uint256 _fileId
    ) external payable onlyPatient {
        File memory file = validateFileExists(_doctor, _fileId);
        uint256 equivalentUSD = msg.value.getEquivalentUSD(s_priceFeed);
        //paying in ETHEREUM
        if (equivalentUSD < file.fee) {
            revert EHRManagement__InsufficientPayment(file.fee, equivalentUSD);
        }
        s_access[_doctor][_fileId][msg.sender].paid = true;

        // Transfer payment to the doctor
        (bool success, ) = _doctor.call{value: msg.value}("");
        if (!success) {
            s_access[_doctor][_fileId][msg.sender].paid = false;
            revert("Payment transfer to doctor failed");
        }

        emit PaymentReceived(msg.sender, _doctor, _fileId, msg.value);
    }

    // Retrieve a file
    function retrieveFile(
        address _owner,
        uint256 _fileId
    ) external view validRole returns (string memory) {
        File memory file = validateFileExists(_owner, _fileId);
        FileAccess memory access = s_access[_owner][_fileId][msg.sender];
        if (
            !access.authorized &&
            (s_roles[msg.sender] == Role.PATIENT && !access.paid)
        ) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        return file.fileHash;
    }

    /*//////////////////////////////////////////////////////////////
                            HELPER FUNCTION
    //////////////////////////////////////////////////////////////*/
    function validateFileExists(
        address owner,
        uint256 fileId
    ) internal view returns (File memory) {
        if (fileId >= s_addressToFiles[owner].length) {
            revert EHRManagement__FileNotFound(fileId, owner);
        }
        return s_addressToFiles[owner][fileId];
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/
    function getLatestPrice() public view returns (uint256) {
        (, int price, , , ) = s_priceFeed.latestRoundData();
        return uint256(price * 1e10); // Adjusting the price to 18 decimals
    }

    function getAddressRole(address subject) external view returns (Role) {
        return s_roles[subject];
    }

    function getAccessToFile(
        address granter,
        uint256 fileId
    ) external view returns (bool authorized, bool paid) {
        FileAccess memory fileAccess = s_access[granter][fileId][msg.sender];
        return (fileAccess.authorized, fileAccess.paid);
    }

    function getFeed() external view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getMyFile(
        uint256 fileId
    ) external view returns (File memory myFile) {
        myFile = validateFileExists(msg.sender, fileId);
    }

    function getAllMyFile() external view returns (File[] memory) {
        return s_addressToFiles[msg.sender];
    }

    function getFileFee(
        address _owner,
        uint256 _fileId
    ) external view returns (uint256) {
        File memory myFile = validateFileExists(_owner, _fileId);
        return myFile.fee;
    }
}
