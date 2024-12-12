// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {Test, console} from "forge-std/Test.sol";
import {EHRManagement} from "../src/EHRManagement.sol";

contract EHRManagementTest is Test {
    EHRManagement ehrManagement;

    address doctor = makeAddr("DOCTOR");
    address patient = makeAddr("PATIENT");

    function setUp() public {
        ehrManagement = new EHRManagement();
        vm.deal(doctor, 1 ether);
        vm.deal(patient, 1 ether);
    }

    function testRegisterUserAsDoctor() public {
        console.log("Initial role:", uint(ehrManagement.getRoles(doctor)));

        assertEq(
            uint(ehrManagement.getRoles(doctor)),
            0, // Assuming 0 is the default/unset role
            "Role should be unset before registration"
        );
        vm.prank(doctor);
        ehrManagement.registerUserAsDoctor();
        assertEq(
            uint(ehrManagement.getRoles(doctor)),
            uint(EHRManagement.Role.DOCTOR)
        );
    }

    function testRegisterUserAsPatient() public {
        vm.prank(patient);
        ehrManagement.registerUserAsPatient();
        assertEq(
            uint(ehrManagement.getRoles(patient)),
            uint(EHRManagement.Role.PATIENT)
        );
    }

    function testUploadReport() public {
        vm.prank(doctor);
        // ehrManagement.registerUserAsDoctor();
        ehrManagement.uploadReport("QmTestIPFSHash", 0.1 ether);

        (string memory file, uint256 fee) = ehrManagement.getFile(doctor, 0);
        assertEq(file, "QmTestIPFSHash");
        assertEq(fee, 0.1 ether);
    }

    function testGrantAccess() public {
        vm.prank(doctor);
        ehrManagement.uploadReport("QmTestIPFSHash", 0.1 ether);
        // ehrManagement.registerUserAsDoctor();
        vm.prank(doctor);
        ehrManagement.grantAccess(patient, 0);

        bool authorized = ehrManagement.getAutorizationStatus(
            doctor,
            0,
            patient
        );
        assertTrue(authorized);
    }

    function testBuyReport() public {
        vm.prank(doctor);
        // ehrManagement.registerUserAsDoctor();
        ehrManagement.uploadReport("QmTestIPFSHash", 0.1 ether);
        vm.prank(doctor);
        ehrManagement.grantAccess(patient, 0);

        vm.prank(patient);
        ehrManagement.registerUserAsPatient();
        vm.prank(patient);
        ehrManagement.buyReport{value: 0.1 ether}(doctor, 0);

        bool paid = ehrManagement.getPaymentStatus(patient, doctor, 0);
        assertTrue(paid);
        vm.prank(patient);
        EHRManagement.File memory testFile = ehrManagement.viewReport(
            doctor,
            0
        );
        assertEq(testFile.file, "QmTestIPFSHash");
        assertEq(testFile.fee, 0.1 ether);
    }
}
