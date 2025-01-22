// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {EHRManagement} from "src/EHRManagement.sol";
import {DeployEHRManagement} from "script/DeployEHRManagement.s.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";

contract EHRManagementTest is Test {
    EHRManagement ehr;
    HelperConfig helperConfig;

    uint256 doctorId;
    uint256 patientId;
    uint256 otherId;
    address doctor;
    address patient;
    address other;

    function setUp() public {
        DeployEHRManagement deployer = new DeployEHRManagement();
        (ehr, helperConfig) = deployer.deployContract();

        doctor = makeAddr("DOCTOR");
        patient = makeAddr("PATIENT");
        other = makeAddr("OTHER");

        // Setup users
        vm.startPrank(doctor);
        ehr.registerUser();
        doctorId = ehr.getUserId();
        vm.stopPrank();

        vm.startPrank(patient);
        ehr.registerUser();
        patientId = ehr.getUserId();
        vm.stopPrank();

        vm.startPrank(other);
        ehr.registerUser();
        otherId = ehr.getUserId();
        vm.stopPrank();

        // Assign roles
        vm.prank(doctor);
        ehr.assignRole(EHRManagement.Role.DOCTOR);

        vm.prank(patient);
        ehr.assignRole(EHRManagement.Role.PATIENT);

        // Fund accounts
        vm.deal(doctor, 10 ether);
        vm.deal(patient, 10 ether);
        vm.deal(other, 10 ether);
    }

    function testUserRegistration() public {
        address newUser = makeAddr("NEW_USER");
        vm.prank(newUser);
        ehr.registerUser();
        vm.prank(newUser);
        uint256 newUserId = ehr.getUserId();
        assertGt(newUserId, 0);
    }

    function testRoleAssignment() public {
        vm.prank(doctor);
        EHRManagement.Role doc = ehr.getUserRole();
        vm.prank(patient);
        EHRManagement.Role pat = ehr.getUserRole();
        assertEq(uint256(doc), uint256(EHRManagement.Role.DOCTOR));
        assertEq(uint256(pat), uint256(EHRManagement.Role.PATIENT));
    }

    function testCannotReassignRole() public {
        vm.prank(doctor);
        vm.expectRevert(EHRManagement.RoleAlreadyAssigned.selector);
        ehr.assignRole(EHRManagement.Role.PATIENT);
    }

    function testFileUpload() public {
        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);
        EHRManagement.File[] memory files = ehr.getMyFiles();
        vm.stopPrank();
        assertEq(files.length, 1);
        assertEq(files[0].fileHash, "QmTestHash");
    }

    function testAccessControl() public {
        // Upload file
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);

        // Grant access
        vm.prank(doctor);
        ehr.grantAccess(patientId, 0);

        // Check access
        vm.prank(patient);
        EHRManagement.FileAccess memory access = ehr.getAccessStatus(
            doctorId,
            0
        );
        assertTrue(access.authorized);
    }

    function testPaymentProcessing() public {
        // Setup file
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", "test", 300);

        // Grant access
        vm.prank(doctor);
        ehr.grantAccess(patientId, 0);

        // Make payment
        vm.prank(patient);
        ehr.payForAccess{value: 0.11 ether}(doctorId, 0);

        // Verify payment
        vm.prank(patient);
        EHRManagement.FileAccess memory access = ehr.getAccessStatus(
            doctorId,
            0
        );
        assertTrue(access.paid);
    }

    function testFileRetrieval() public {
        // Setup file and access
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);

        vm.prank(doctor);
        ehr.grantAccess(patientId, 0);

        // Pay and retrieve
        vm.startPrank(patient);
        ehr.payForAccess{value: 0.05 ether}(doctorId, 0);

        string memory content = ehr.retrieveFile(doctorId, 0);
        vm.stopPrank();
        assertEq(content, "QmTestHash");
    }

    function testUnauthorizedAccess() public {
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);

        vm.prank(other);
        vm.expectRevert(EHRManagement.PermissionDenied.selector);
        ehr.retrieveFile(doctorId, 0);
    }

    function testAccessRevocation() public {
        // Setup access
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);
        vm.prank(doctor);
        ehr.grantAccess(patientId, 0);

        // Revoke access
        vm.prank(doctor);
        ehr.revokeAccess(patientId, 0);

        // Verify revocation
        EHRManagement.FileAccess memory access = ehr.getAccessStatus(
            doctorId,
            0
        );
        assertFalse(access.authorized);
    }

    function testFeeManagement() public {
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", "test", 50);

        uint256 fee = ehr.getFileFee(doctorId, 0);
        assertEq(fee, 50 * 1e18);
    }

    function testMultipleFiles() public {
        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash1", "test1", 10);
        ehr.uploadReport("QmTestHash2", "test2", 20);
        EHRManagement.File[] memory files = ehr.getMyFiles();
        vm.stopPrank();
        assertEq(files.length, 2);
        assertEq(files[1].fee, 20 * 1e18);
    }
}
