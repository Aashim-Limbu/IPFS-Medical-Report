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
        bytes32 fileHash; // Optimized to bytes32 for gas efficiency
        uint256 fee;
    }

    struct FileAccess {
        bool authorized;
        bool paid;
    }

    // Mappings
    mapping(address => Role) private s_roles;
    mapping(address => mapping(uint256 => File)) private s_addressToFiles;
    mapping(address => mapping(uint256 => mapping(address => FileAccess)))
        private s_access;

    // Global counter for unique file IDs
    uint256 private s_globalFileCounter;
    AggregatorV3Interface private s_priceFeed;

    // Events
    event RoleAssigned(address indexed user, Role role);
    event FileUploaded(
        address indexed doctor,
        uint256 indexed fileId,
        bytes32 fileHash,
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
    error EHRManagement__FileNotFound();
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
        s_roles[_user] = _role;
        emit RoleAssigned(_user, _role);
    }

    // Upload a medical report
    function uploadReport(
        string memory _ipfsHash,
        uint256 _fee // in USD
    ) external {
        uint256 newFileId = s_globalFileCounter++;
        s_addressToFiles[msg.sender][newFileId] = File({
            fileHash: keccak256(abi.encodePacked(_ipfsHash)),
            fee: _fee * 1e18
        });
        emit FileUploaded(
            msg.sender,
            newFileId,
            keccak256(abi.encodePacked(_ipfsHash)),
            _fee * 1e18
        );
    }

    // Grant access to a file
    function grantAccess(address _grantee, uint256 _fileId) external validRole {
        if (
            bytes32(s_addressToFiles[msg.sender][_fileId].fileHash) ==
            bytes32(0)
        ) {
            revert EHRManagement__FileNotFound();
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
        File memory file = s_addressToFiles[_doctor][_fileId];
        if (file.fee == 0) {
            revert EHRManagement__FileNotFound();
        }

        uint256 equivalentUSD = msg.value.getEquivalentUSD(s_priceFeed);

        if (equivalentUSD < file.fee) {
            revert EHRManagement__InsufficientPayment(file.fee, equivalentUSD);
        }
        s_access[_doctor][_fileId][msg.sender].paid = true;

        // Transfer payment to the doctor
        (bool success, ) = _doctor.call{value: msg.value}("");
        if (!success) {
            revert("Payment transfer to doctor failed");
        }

        emit PaymentReceived(msg.sender, _doctor, _fileId, msg.value);
    }

    // Retrieve a file
    function retrieveFile(
        address _owner,
        uint256 _fileId
    ) external view validRole returns (bytes32) {
        FileAccess memory access = s_access[_owner][_fileId][msg.sender];
        if (
            !access.authorized &&
            (s_roles[msg.sender] == Role.PATIENT && !access.paid)
        ) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        return s_addressToFiles[_owner][_fileId].fileHash;
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/
    function getAddressRole(address subject) external view returns (Role) {
        return s_roles[subject];
    }

    function getMyFile(
        uint256 fileCounter
    ) external view returns (bytes32 fHash, uint256 fee) {
        File memory file = s_addressToFiles[msg.sender][fileCounter];
        return (file.fileHash, file.fee);
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
}
