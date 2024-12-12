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
            0,
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
        vm.startPrank(doctor);
        ehrManagement.registerUserAsDoctor();
        ehrManagement.uploadReport("QmTestIPFSHash", 0.1 ether);
        assertEq(ehrManagement.getFileCounterStatus(), 1);
        vm.stopPrank();
        (string memory file, uint256 fee) = ehrManagement.getFile(doctor, 0);
        assertEq(file, "QmTestIPFSHash");
        assertEq(fee, 0.1 ether);
    }

    function testGrantAccess() public {
        vm.startPrank(doctor);
        ehrManagement.uploadReport("QmTestIPFSHash", 0.1 ether);
        ehrManagement.registerUserAsDoctor();
        ehrManagement.grantAccess(patient, 0);
        vm.stopPrank();

        bool authorized = ehrManagement.getAutorizationStatus(
            doctor,
            0,
            patient
        );
        assertTrue(authorized);
    }

    function testBuyReport() public {
        vm.startPrank(doctor);
        ehrManagement.registerUserAsDoctor();
        ehrManagement.uploadReport("QmTestIPFSHash", 0.1 ether);
        ehrManagement.grantAccess(patient, 0);
        vm.stopPrank();

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

    function testDoctorUploadFileAndPatientForwardToOtherDoctor() public {
        // Doctor1 uploads a file
        address doctor1 = makeAddr("DOCTOR1");
        address doctor2 = makeAddr("DOCTOR2");
        hoax(doctor1, 1 ether);
        hoax(doctor2, 1 ether);
        vm.prank(doctor1);
        ehrManagement.uploadReport("QmTestIPFSHash", 0.1 ether); // Doctor1 grants access to patient
        vm.prank(doctor1);
        ehrManagement.grantAccess(patient, 0); // Patient buys the report from Doctor1
        vm.prank(patient);
        ehrManagement.buyReport{value: 0.1 ether}(doctor1, 0); // Patient forwards the report to Doctor2
        vm.prank(patient);
        ehrManagement.uploadReport("QmTestIPFSHashFromPatient", 0.1 ether);
        vm.startPrank(patient);
        ehrManagement.grantAccess(doctor2, 0); // Check if the forward is logged correctly
        uint256 fileCounter = ehrManagement.getFileCounterStatus();
        address originalDoctor = ehrManagement.getForwardedAddress(0);
        assertEq(originalDoctor, doctor1); // Verify Doctor2 can view the forwarded report
        vm.stopPrank();
        vm.prank(doctor2);
        EHRManagement.File memory forwardedFile = ehrManagement.viewReport(
            patient,
            0
        );
        assertEq(forwardedFile.file, "QmTestIPFSHashFromPatient");
        assertEq(forwardedFile.fee, 0.1 ether); // Verify the original doctor and file
        (string memory file, uint256 fee) = ehrManagement.getFile(doctor1, 0);
        assertEq(file, "QmTestIPFSHash");
        assertEq(fee, 0.1 ether);
    }
}
