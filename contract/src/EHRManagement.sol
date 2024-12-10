// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract EHRManagement {
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
                             STATE VARIABLE
    //////////////////////////////////////////////////////////////*/

    mapping(address => Role) private s_roles;
    uint256 private s_fileCounter = 0;

    // Nested Mapping (doctor>fileId>file)
    mapping(address => mapping(uint256 => File)) private s_addressToFiles; // a single user many have multiple file
    //Nested Mapping (patient>fileId>doctor>true) or viceversa
    mapping(address => mapping(uint256 => mapping(address => bool)))
        private s_authorize;
    /*//////////////////////////////////////////////////////////////
                            ERRORS & EVENTS
    //////////////////////////////////////////////////////////////*/

    error EHRManagement__RolePermissionDenied(Role authorizedRole);
    error EHRManagement__PermissionDenied(address unAuthorizedAddress);
    error EHRManagement__InsufficientPayment(
        uint256 requiredBalance,
        uint256 submittedBalance
    );

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
    event RoleAssigned(address indexed user, Role indexed Role);
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
        s_roles[msg.sender] = Role.DOCTOR;
        emit RoleAssigned(msg.sender, Role.DOCTOR);
    }

    function registerUserAsPatient() public {
        s_roles[msg.sender] = Role.PATIENT;
        emit RoleAssigned(msg.sender, Role.DOCTOR);
    }

    function uploadReport(
        string memory _ipfsHash,
        uint256 _fee
    ) public onlyDoctor {
        File memory newfile = File({file: _ipfsHash, fee: _fee});
        s_addressToFiles[msg.sender][s_fileCounter] = newfile;
        emit FileUploaded(msg.sender, s_fileCounter, _ipfsHash, _fee);
        s_fileCounter++;
    }

    function grantAccess(address _user, uint256 _fileCounter) public {
        s_authorize[msg.sender][_fileCounter][_user] = true;
        emit PermissionGranted(_user, msg.sender, _fileCounter);
    }

    function viewReport(
        address _granter,
        uint256 _fileCounter
    ) public view onlyPatients returns (File memory) {
        if (s_authorize[_granter][_fileCounter][msg.sender] != true) {
            revert EHRManagement__PermissionDenied(msg.sender);
        }
        return s_addressToFiles[_granter][s_fileCounter];
    }
}
