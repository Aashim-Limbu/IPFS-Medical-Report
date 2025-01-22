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

    // User structure
    struct User {
        Role role;
        uint256 userId;
        address userAddress;
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
    mapping(address => uint256) private s_addressToUserId;
    mapping(uint256 => User) private s_users;
    mapping(uint256 => File[]) private s_userFiles;
    //doctorId => fileId => patientId => FileAccess
    mapping(uint256 => mapping(uint256 => mapping(uint256 => FileAccess)))
        private s_access;

    // State variables
    AggregatorV3Interface private s_priceFeed;
    uint256 private s_userIdCounter;

    // Events
    event UserRegistered(address indexed user, uint256 indexed userId);
    event RoleAssigned(uint256 indexed userId, Role role);
    event FileUploaded(
        uint256 indexed userId,
        uint256 indexed fileId,
        string fileHash,
        uint256 fee
    );
    event AccessGranted(
        uint256 indexed granterId,
        uint256 indexed granteeId,
        uint256 indexed fileId
    );
    event AccessRevoked(
        uint256 indexed granterId,
        uint256 indexed granteeId,
        uint256 indexed fileId
    );
    event PaymentReceived(
        uint256 indexed patientId,
        uint256 indexed doctorId,
        uint256 indexed fileId,
        uint256 amount
    );

    // Custom errors
    error PermissionDenied();
    error FileNotFound();
    error RoleAlreadyAssigned();
    error InsufficientPayment();
    error UserNotRegistered();
    error InvalidCaller();

    // Modifiers
    modifier onlyDoctor() {
        User memory user = s_users[s_addressToUserId[msg.sender]];
        if (user.role != Role.DOCTOR) revert PermissionDenied();
        _;
    }

    modifier onlyPatient() {
        User memory user = s_users[s_addressToUserId[msg.sender]];
        if (user.role != Role.PATIENT) revert PermissionDenied();
        _;
    }

    modifier validUser() {
        if (s_addressToUserId[msg.sender] == 0) revert UserNotRegistered();
        _;
    }

    constructor(address _priceFeed) {
        s_priceFeed = AggregatorV3Interface(_priceFeed);
    }

    // User registration
    function registerUser(Role _role) external {
        if (s_addressToUserId[msg.sender] != 0) revert RoleAlreadyAssigned();

        uint256 userId = s_userIdCounter++;
        s_addressToUserId[msg.sender] = s_userIdCounter;
        s_users[s_userIdCounter] = User({
            role: _role,
            userId: userId,
            userAddress: msg.sender
        });

        emit UserRegistered(msg.sender, s_userIdCounter);
    }

    // Role assignment
    function assignRole(Role _role) external validUser {
        uint256 userId = s_addressToUserId[msg.sender];
        if (s_users[userId].role != Role.NONE) revert RoleAlreadyAssigned();

        s_users[userId].role = _role;
        emit RoleAssigned(userId, _role);
    }

    // File management
    function uploadReport(
        string memory _ipfsHash,
        string memory _name,
        uint256 _fee
    ) external validUser {
        uint256 userId = s_addressToUserId[msg.sender];
        uint256 newFileId = s_userFiles[userId].length;
        if (_fee < 0) revert InsufficientPayment();
        s_userFiles[userId].push(
            File({
                fileHash: _ipfsHash,
                fileName: _name,
                fileId: newFileId,
                fee: _fee * 1e18
            })
        );

        emit FileUploaded(userId, newFileId, _ipfsHash, _fee * 1e18);
    }

    // Access control
    function grantAccess(
        uint256 _granteeId,
        uint256 _fileId
    ) external validUser {
        uint256 granterId = s_addressToUserId[msg.sender];
        File memory file = _validateFileExists(granterId, _fileId);
        s_access[granterId][file.fileId][_granteeId] = FileAccess({
            authorized: true,
            paid: false
        });

        emit AccessGranted(granterId, _granteeId, _fileId);
    }

    function revokeAccess(
        uint256 _granteeId,
        uint256 _fileId
    ) external validUser {
        uint256 granterId = s_addressToUserId[msg.sender];
        if (!s_access[granterId][_fileId][_granteeId].authorized)
            revert PermissionDenied();

        delete s_access[granterId][_fileId][_granteeId];
        emit AccessRevoked(granterId, _granteeId, _fileId);
    }

    // Payments
    function payForAccess(
        uint256 _doctorId,
        uint256 _fileId
    ) external payable validUser {
        uint256 patientId = s_addressToUserId[msg.sender];
        File memory file = _validateFileExists(_doctorId, _fileId);

        uint256 equivalentUSD = msg.value.getEquivalentUSD(s_priceFeed);
        if (equivalentUSD < file.fee) revert InsufficientPayment();

        s_access[_doctorId][_fileId][patientId].paid = true;

        address doctorAddress = s_users[_doctorId].userAddress;
        (bool success, ) = doctorAddress.call{value: msg.value}("");
        if (!success) {
            s_access[_doctorId][_fileId][patientId].paid = false;
            revert("Payment failed");
        }

        emit PaymentReceived(patientId, _doctorId, _fileId, msg.value);
    }

    // File retrieval
    function retrieveFile(
        uint256 _ownerId,
        uint256 _fileId
    ) external view validUser returns (string memory) {
        uint256 requesterId = s_addressToUserId[msg.sender];
        File memory file = _validateFileExists(_ownerId, _fileId);
        FileAccess memory access = s_access[_ownerId][_fileId][requesterId];

        if (
            !access.authorized ||
            (s_users[requesterId].role == Role.PATIENT && !access.paid)
        ) {
            revert PermissionDenied();
        }

        return file.fileHash;
    }

    // Helper functions
    function _validateFileExists(
        uint256 userId,
        uint256 fileId
    ) internal view returns (File memory) {
        if (fileId >= s_userFiles[userId].length) revert FileNotFound();
        return s_userFiles[userId][fileId];
    }

    // Getters
    function getLatestPrice() public view returns (uint256) {
        (, int price, , , ) = s_priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getUserRole() external view returns (Role) {
        return s_users[s_addressToUserId[msg.sender]].role;
    }

    function getUserId() external view returns (uint256) {
        return s_addressToUserId[msg.sender];
    }

    function getMyFiles() external view validUser returns (File[] memory) {
        return s_userFiles[s_addressToUserId[msg.sender]];
    }

    function getFileFee(
        uint256 userId,
        uint256 fileId
    ) external view returns (uint256) {
        return _validateFileExists(userId, fileId).fee;
    }

    function getAccessStatus(
        uint256 granterId,
        uint256 fileId
    ) external view returns (FileAccess memory) {
        return s_access[granterId][fileId][s_addressToUserId[msg.sender]];
    }
}
