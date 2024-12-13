// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {EHRManagement} from "src/EHRManagement.sol";
import {DeployEHRManagement} from "script/DeployEHRManagement.s.sol";

contract EHRManagementTest is Test {
    EHRManagement ehr;
    address owner;
    address doctor;
    address patient;
    address other;

    function setUp() public {
        // Deploy the contract
        DeployEHRManagement deployer = new DeployEHRManagement();
        ehr = deployer.deployContract();
        owner = address(this);
        doctor = makeAddr("DOCTOR");
        patient = makeAddr("PATIENT");
        other = address(0x3);

        // Assign roles
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);
        ehr.assignRole(patient, EHRManagement.Role.PATIENT);
        vm.deal(doctor, 10 ether);
        vm.deal(patient, 10 ether);
        vm.deal(other, 10 ether);
    }

    function testAssignRole() public view {
        // Verify roles assigned
        assertEq(
            uint256(ehr.getAddressRole(doctor)),
            uint256(EHRManagement.Role.DOCTOR)
        );
        assertEq(
            uint256(ehr.getAddressRole(patient)),
            uint256(EHRManagement.Role.PATIENT)
        );
    }

    function testUploadReport() public {
        // Upload a report as a doctor
        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", 1 ether);

        // Verify the file
        (bytes32 fileHash, uint256 fee) = ehr.getMyFile(0);
        vm.stopPrank();
        assertEq(fileHash, keccak256(abi.encodePacked("QmTestHash")));
        assertEq(fee, 1 ether);
    }

    function testGrantAccess() public {
        // Upload a report
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", 1 ether);

        // Grant access to the patient
        vm.prank(doctor);
        ehr.grantAccess(patient, 0);

        // Verify access granted
        vm.prank(patient);
        (bool authorized, bool paid) = ehr.getAccessToFile(doctor, 0);
        assertTrue(authorized);
        assertFalse(paid);
    }

    function testPayForAccess() public {
        // Upload a report and grant access
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", 1 ether);
        vm.prank(doctor);
        ehr.grantAccess(patient, 0);

        // Pay for access
        vm.startPrank(patient);
        ehr.payForAccess{value: 1 ether}(doctor, 0);

        // Verify payment

        (bool authorized, bool paid) = ehr.getAccessToFile(doctor, 0);
        vm.stopPrank();
        assertTrue(authorized);
        assertTrue(paid);
    }

    function testRetrieveFile() public {
        // Upload a report, grant access, and pay
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", 1 ether);
        vm.prank(doctor);
        ehr.grantAccess(patient, 0);
        vm.prank(patient);
        ehr.payForAccess{value: 1 ether}(doctor, 0);

        // Retrieve the file
        vm.prank(patient);
        bytes32 retrievedHash = ehr.retrieveFile(doctor, 0);
        assertEq(retrievedHash, keccak256(abi.encodePacked("QmTestHash")));
    }

    function testRevokeAccess() public {
        // Upload a report and grant access
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", 1 ether);
        vm.prank(doctor);
        ehr.grantAccess(patient, 0);

        // Revoke access
        vm.prank(doctor);
        ehr.revokeAccess(patient, 0);

        // Verify access revoked
        vm.prank(patient);
        (bool authorized, ) = ehr.getAccessToFile(doctor, 0);
        assertFalse(authorized);
    }

    function testUnauthorizedAccess() public {
        // Upload a report
        vm.prank(doctor);
        ehr.uploadReport("QmTestHash", 1 ether);

        // Try retrieving without access
        vm.expectRevert(
            abi.encodeWithSelector(
                EHRManagement.EHRManagement__PermissionDenied.selector,
                other
            )
        );
        vm.prank(other);
        ehr.retrieveFile(doctor, 0);
    }

    function testMultiplePatientHandover() public {
        address patient2 = makeAddr("PATIENT2");
        vm.deal(patient2, 10 ether);

        vm.startPrank(doctor);
        vm.expectEmit(true, true, false, true, address(ehr));
        emit EHRManagement.FileUploaded(
            doctor,
            0,
            keccak256(abi.encodePacked("QmTestHash")),
            1 ether
        );
        ehr.uploadReport("QmTestHash", 1 ether);
        // Doctor grants access
        vm.expectEmit(true, true, true, false, address(ehr));
        emit EHRManagement.AccessGranted(doctor, patient, 0);
        ehr.grantAccess(patient, 0);

        vm.stopPrank();
        // Start prank for patient
        vm.startPrank(patient);

        // Patient retrieves the file
        ehr.payForAccess{value: 1 ether}(doctor, 0);
        bytes32 filehash = ehr.retrieveFile(doctor, 0);
        assertEq(filehash, keccak256(abi.encodePacked("QmTestHash"))); // Assertion

        // Stop prank for patient (optional but clean)
        vm.stopPrank();
    }
}
