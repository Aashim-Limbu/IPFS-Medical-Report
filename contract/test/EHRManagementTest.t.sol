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
        ehr.uploadReport("InvalidHash", 10);
        vm.stopPrank();

        vm.startPrank(doctor);
        ehr.uploadReport("ValidHash", 10);
        (string memory fileHash, uint256 fee) = ehr.getMyFile(0);
        assertEq(fileHash, "ValidHash");
        assertEq(fee, 10 * 1e18);
        vm.stopPrank();
    }

    function testUploadReport() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);

        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", 5);
        (string memory fileHash, uint256 fee) = ehr.getMyFile(0);
        vm.stopPrank();

        assertEq(fileHash, "QmTestHash");
        assertEq(fee, 5 * 1e18);
    }

    function testGrantAccess() public {
        ehr.assignRole(doctor, EHRManagement.Role.DOCTOR);
        ehr.assignRole(patient, EHRManagement.Role.PATIENT);

        vm.startPrank(doctor);
        ehr.uploadReport("QmTestHash", 50);
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
        ehr.uploadReport("QmTestHash", 50);
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
        ehr.uploadReport("QmTestHash", 2000);
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
        ehr.uploadReport("QmTestHash", 1 ether);
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
        ehr.uploadReport("QmTestHash", 1 ether);
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
        ehr.uploadReport("QmTestHash", 50);
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
        ehr.uploadReport("QmTestHash", 50);
        vm.prank(patient);
        uint256 file_fee = ehr.getFileFee(doctor, 0);
        assertEq(file_fee , 50e18);
    }
}
