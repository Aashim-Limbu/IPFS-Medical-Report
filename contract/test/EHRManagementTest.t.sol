// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console} from "forge-std/Test.sol";
import {EHRManagement} from "src/EHRManagement.sol";
import {PriceConverter} from "src/PriceConverter.sol";
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
        ehr.uploadReport("QmTestHash", 5); // Fee in USD, assuming precision (1e18)
        // Verify the file
        (string memory fileHash, uint256 fee) = ehr.getMyFile(0);
        vm.stopPrank();
        assertEq(fileHash, "QmTestHash");
        assertEq(fee, 5 * 1e18);
    }

    function testGrantAccess() public {
        // Upload a report
        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", 50);
        vm.stopPrank();

        // Grant access to the patient
        vm.startPrank(doctor);
        ehr.grantAccess(patient, 0);
        vm.stopPrank();

        // Verify access granted
        vm.startPrank(patient);
        (bool authorized, bool paid) = ehr.getAccessToFile(doctor, 0);
        assertTrue(authorized);
        assertFalse(paid);
        vm.stopPrank();
    }

    function testPayForAccess() public {
        // Upload a report and grant access
        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", 50);
        ehr.grantAccess(patient, 0);
        vm.stopPrank();

        // Pay for access
        vm.startPrank(patient);
        ehr.payForAccess{value: 0.025 ether}(doctor, 0);
        vm.stopPrank();

        // Verify payment
        vm.startPrank(patient);
        (bool authorized, bool paid) = ehr.getAccessToFile(doctor, 0);
        assertTrue(authorized);
        assertTrue(paid);
        vm.stopPrank();
    }

    function testRetrieveFile() public {
        // Upload a report, grant access, and pay
        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", 2000);
        ehr.grantAccess(patient, 0);
        vm.stopPrank();

        vm.startPrank(patient);
        ehr.payForAccess{value: 1 ether}(doctor, 0);
        vm.stopPrank();

        // Retrieve the file
        vm.startPrank(patient);
        string memory retrievedHash = ehr.retrieveFile(doctor, 0);
        assertEq(retrievedHash, "QmTestHash");
        vm.stopPrank();
    }

    function testRevokeAccess() public {
        // Upload a report and grant access
        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", 1 ether);
        ehr.grantAccess(patient, 0);
        vm.stopPrank();

        // Revoke access
        vm.startPrank(doctor);
        ehr.revokeAccess(patient, 0);
        vm.stopPrank();

        // Verify access revoked
        vm.startPrank(patient);
        (bool authorized, ) = ehr.getAccessToFile(doctor, 0);
        assertFalse(authorized);
        vm.stopPrank();
    }

    function testUnauthorizedAccess() public {
        // Upload a report
        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", 1 ether);
        vm.stopPrank();

        // Try retrieving without access
        vm.expectRevert(
            abi.encodeWithSelector(
                EHRManagement.EHRManagement__PermissionDenied.selector,
                other
            )
        );
        vm.startPrank(other);
        ehr.retrieveFile(doctor, 0);
        vm.stopPrank();
    }

    function testMultiplePatientHandover() public {
        vm.startPrank(doctor);
        vm.expectEmit(true, true, false, true, address(ehr));
        emit EHRManagement.FileUploaded(doctor, 0, "QmTestHash", 50 * 1e18);
        ehr.uploadReport("QmTestHash", 50);
        // Doctor grants access
        vm.expectEmit(true, true, true, false, address(ehr));
        emit EHRManagement.AccessGranted(doctor, patient, 0);
        ehr.grantAccess(patient, 0);
        vm.stopPrank();

        // Patient retrieves the file
        vm.startPrank(patient);
        ehr.payForAccess{value: 0.025 ether}(doctor, 0);
        string memory filehash = ehr.retrieveFile(doctor, 0);
        assertEq(filehash, "QmTestHash");
        vm.stopPrank();

        address patient2 = makeAddr("PATIENT2");
        vm.deal(patient2, 10 ether);
        vm.startPrank(patient2);
        ehr.assignRole(patient2, EHRManagement.Role.PATIENT);
        ehr.uploadReport("QmTestHash", 50);
        vm.expectEmit(true, true, true, false, address(ehr));
        emit EHRManagement.AccessGranted(patient2, doctor, 0);
        ehr.grantAccess(doctor, 0);
        vm.stopPrank();

        vm.startPrank(doctor);
        ehr.retrieveFile(patient2, 0);
        vm.stopPrank();
    }
}
