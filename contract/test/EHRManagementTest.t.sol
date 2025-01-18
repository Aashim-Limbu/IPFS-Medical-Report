// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {EHRManagement} from "src/EHRManagement.sol";
import {DeployEHRManagement} from "script/DeployEHRManagement.s.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";

contract EHRManagementTest is Test {
    EHRManagement ehr;
    HelperConfig helperConfig;
    address owner;
    address doctor;
    address patient;
    address other;

    function setUp() public {
        // Deploy the contract
        DeployEHRManagement deployer = new DeployEHRManagement();
        (ehr, helperConfig) = deployer.deployContract();
        owner = address(this);
        doctor = makeAddr("DOCTOR");
        patient = makeAddr("PATIENT");
        other = address(0x3);

        // Assign initial ether balances
        vm.deal(doctor, 10 ether);
        vm.deal(patient, 10 ether);
        vm.deal(other, 10 ether);
    }

    function testAssignRole() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);
        ehr.assignRole(patient, EHRManagement.Role.PATIENT);

        assertEq(
            uint256(ehr.getAddressRole(doctor)),
            uint256(EHRManagement.Role.DOCTOR)
        );
        assertEq(
            uint256(ehr.getAddressRole(patient)),
            uint256(EHRManagement.Role.PATIENT)
        );
    }

    function testCannotReassignRole() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);

        vm.expectRevert(
            abi.encodeWithSelector(
                EHRManagement.EHRManagement__RoleAlreadyAssigned.selector,
                doctor,
                EHRManagement.Role.DOCTOR
            )
        );
        ehr.assignRole(doctor, EHRManagement.Role.PATIENT);

        assertEq(
            uint(ehr.getAddressRole(doctor)),
            uint(EHRManagement.Role.DOCTOR)
        );
    }

    function testOnlyValidRoleCanUploadReport() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);

        vm.startPrank(other);
        vm.expectRevert(
            abi.encodeWithSelector(
                EHRManagement.EHRManagement__PermissionDenied.selector,
                other
            )
        );
        ehr.uploadReport("InvalidHash", "test", 10);
        vm.stopPrank();

        vm.startPrank(doctor);
        ehr.uploadReport("ValidHash", "test", 10);
        EHRManagement.File memory myFile = ehr.getMyFile(0);
        assertEq(myFile.fileHash, "ValidHash");
        assertEq(myFile.fileId, 0);
        assertEq(myFile.fee, 10 * 1e18);
        vm.stopPrank();
    }

    function testUploadReport() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);

        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", "test", 5);
        EHRManagement.File memory myFile = ehr.getMyFile(0);
        vm.stopPrank();
        assertEq(myFile.fileHash, "QmTestHash");
        assertEq(myFile.fee, 5 * 1e18);
    }

    function testGrantAccess() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);
        ehr.assignRole(patient, EHRManagement.Role.PATIENT);

        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);
        ehr.grantAccess(patient, 0);
        vm.stopPrank();

        vm.startPrank(patient);
        (bool authorized, bool paid) = ehr.getAccessToFile(doctor, 0);
        assertTrue(authorized);
        assertFalse(paid);
        vm.stopPrank();
    }

    function testPayForAccess() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);
        ehr.assignRole(patient, EHRManagement.Role.PATIENT);

        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);
        ehr.grantAccess(patient, 0);
        vm.stopPrank();

        vm.startPrank(patient);
        ehr.payForAccess{value: 0.025 ether}(doctor, 0);
        vm.stopPrank();

        vm.startPrank(patient);
        (bool authorized, bool paid) = ehr.getAccessToFile(doctor, 0);
        assertTrue(authorized);
        assertTrue(paid);
        vm.stopPrank();
    }

    function testRetrieveFile() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);
        ehr.assignRole(patient, EHRManagement.Role.PATIENT);

        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", "test", 2000);
        ehr.grantAccess(patient, 0);
        vm.stopPrank();

        vm.startPrank(patient);
        ehr.payForAccess{value: 1 ether}(doctor, 0);
        string memory retrievedHash = ehr.retrieveFile(doctor, 0);
        assertEq(retrievedHash, "QmTestHash");
        vm.stopPrank();
    }

    function testRevokeAccess() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);
        ehr.assignRole(patient, EHRManagement.Role.PATIENT);

        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", "test", 1 ether);
        ehr.grantAccess(patient, 0);
        ehr.revokeAccess(patient, 0);
        vm.stopPrank();

        vm.startPrank(patient);
        (bool authorized, ) = ehr.getAccessToFile(doctor, 0);
        assertFalse(authorized);
        vm.stopPrank();
    }

    function testUnauthorizedAccess() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);

        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", "test", 1 ether);
        vm.stopPrank();

        vm.startPrank(other);
        vm.expectRevert(
            abi.encodeWithSelector(
                EHRManagement.EHRManagement__PermissionDenied.selector,
                other
            )
        );
        ehr.retrieveFile(doctor, 0);
        vm.stopPrank();
    }

    function testMultiplePatientHandover() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);
        ehr.assignRole(patient, EHRManagement.Role.PATIENT);

        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);
        ehr.grantAccess(patient, 0);
        vm.stopPrank();

        vm.startPrank(patient);
        ehr.payForAccess{value: 0.025 ether}(doctor, 0);
        string memory filehash = ehr.retrieveFile(doctor, 0);
        assertEq(filehash, "QmTestHash");
        vm.stopPrank();
    }

    function testGetFileFee() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);
        ehr.assignRole(patient, EHRManagement.Role.PATIENT);
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);
        vm.prank(patient);
        uint256 file_fee = ehr.getFileFee(doctor, 0);
        assertEq(file_fee, 50e18);
    }

    function testGetUserAllFile() public {
        address alice = makeAddr("ALICE");
        vm.deal(alice, 10 ether);
        ehr.assignRole(alice, EHRManagement.Role.PATIENT);
        vm.startPrank(alice);
        ehr.uploadReport("QmTestHash", "test", 50);
        ehr.uploadReport("QmTestHash2", "test", 100);
        ehr.uploadReport("QmTestHash3", "test", 150);
        EHRManagement.File[] memory files = ehr.getAllMyFile();
        vm.stopPrank();
        assertEq(files.length, 3);
    }

    function testGetMyFile() public {
        address alon = makeAddr("ALON");
        vm.deal(alon, 10 ether);
        ehr.assignRole(alon, EHRManagement.Role.PATIENT);
        vm.startPrank(alon);
        ehr.uploadReport("QmTestHash", "test", 50);
        ehr.uploadReport("QmTestHash1", "test", 100);
        EHRManagement.File memory myFile1 = ehr.getMyFile(0);
        // string memory fHash = file0.fileHash;
        // uint256 fee = file0.fee;
        EHRManagement.File memory myFile2 = ehr.getMyFile(1);
        // string memory fHash1 = file1.fileHash;
        // uint256 fee1 = file1.fee;
        assertEq(myFile1.fileHash, "QmTestHash");
        assertEq(myFile1.fee, 50e18);
        assertEq(myFile2.fileHash, "QmTestHash1");
        assertEq(myFile2.fee, 100e18);
        vm.stopPrank();
    }
}
