// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract EHRManagementOptimized is ReentrancyGuard, AccessControl {
    /*//////////////////////////////////////////////////////////////
                              DECLARATION
    //////////////////////////////////////////////////////////////*/

    struct File {
        string ipfsHash;
        uint256 fee;
    }

    struct Authorization {
        address granter;
        uint256 fileId;
        bool isAuthorized;
        bool isPaid;
    }

    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");

    /*//////////////////////////////////////////////////////////////
                             STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    mapping(address => uint256) private _fileCounters;
    mapping(address => mapping(uint256 => File)) private _files;
    mapping(address => mapping(uint256 => mapping(address => Authorization)))
        private _authorizations;

    /*//////////////////////////////////////////////////////////////
                            ERRORS & EVENTS
    //////////////////////////////////////////////////////////////*/

    error InsufficientPayment(uint256 required, uint256 submitted);
    error UnauthorizedAccess(address user);
    error FileNotFound(uint256 fileId);
    error AlreadyRegistered(address user);

    event FileUploaded(
        address indexed uploader,
        uint256 indexed fileId,
        string ipfsHash,
        uint256 fee
    );
    event PermissionGranted(
        address indexed granter,
        address indexed recipient,
        uint256 indexed fileId
    );
    event PaymentReceived(
        address indexed doctor,
        address indexed patient,
        uint256 amount
    );

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyRole(bytes32 role) override {
        if (!hasRole(role, msg.sender)) {
            revert UnauthorizedAccess(msg.sender);
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function registerDoctor() external {
        if (hasRole(DOCTOR_ROLE, msg.sender)) {
            revert AlreadyRegistered(msg.sender);
        }
        _grantRole(DOCTOR_ROLE, msg.sender);
    }

    function registerPatient() external {
        if (hasRole(PATIENT_ROLE, msg.sender)) {
            revert AlreadyRegistered(msg.sender);
        }
        _grantRole(PATIENT_ROLE, msg.sender);
    }

    function uploadReport(
        string calldata ipfsHash,
        uint256 fee
    ) external onlyRole(DOCTOR_ROLE) {
        uint256 fileId = _fileCounters[msg.sender];
        _files[msg.sender][fileId] = File({ipfsHash: ipfsHash, fee: fee});
        _fileCounters[msg.sender]++;
        emit FileUploaded(msg.sender, fileId, ipfsHash, fee);
    }

    function grantAccess(
        address recipient,
        uint256 fileId
    ) external onlyRole(DOCTOR_ROLE) {
        File storage file = _files[msg.sender][fileId];
        if (bytes(file.ipfsHash).length == 0) {
            revert FileNotFound(fileId);
        }
        _authorizations[msg.sender][fileId][recipient] = Authorization({
            granter: msg.sender,
            fileId: fileId,
            isAuthorized: true,
            isPaid: false
        });
        emit PermissionGranted(msg.sender, recipient, fileId);
    }

    function buyReport(
        address doctor,
        uint256 fileId
    ) external payable onlyRole(PATIENT_ROLE) nonReentrant {
        Authorization storage auth = _authorizations[doctor][fileId][
            msg.sender
        ];
        File storage file = _files[doctor][fileId];

        if (!auth.isAuthorized) {
            revert UnauthorizedAccess(msg.sender);
        }
        if (file.fee > msg.value) {
            revert InsufficientPayment(file.fee, msg.value);
        }

        (bool success, ) = payable(doctor).call{value: msg.value}("");
        require(success, "Payment failed");

        auth.isPaid = true;
        emit PaymentReceived(doctor, msg.sender, msg.value);
    }

    function viewReport(
        address doctor,
        uint256 fileId
    ) external view onlyRole(PATIENT_ROLE) returns (File memory) {
        Authorization storage auth = _authorizations[doctor][fileId][
            msg.sender
        ];
        if (!auth.isAuthorized || !auth.isPaid) {
            revert UnauthorizedAccess(msg.sender);
        }
        return _files[doctor][fileId];
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function getFile(
        address uploader,
        uint256 fileId
    ) external view returns (File memory) {
        return _files[uploader][fileId];
    }

    function getAuthorizationStatus(
        address doctor,
        uint256 fileId,
        address patient
    ) external view returns (Authorization memory) {
        return _authorizations[doctor][fileId][patient];
    }

    function getFileCounter(address user) external view returns (uint256) {
        return _fileCounters[user];
    }
}
