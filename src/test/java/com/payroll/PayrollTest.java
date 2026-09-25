package com.payroll;

import org.junit.Test;
import static org.junit.Assert.*;

public class PayrollTest {

    @Test
    public void testCalculateNetSalary() {
        Payroll payroll = new Payroll();
        double netSalary = payroll.calculateNetSalary(50000.0, 5000.0, 2000.0);
        // Expected: 50000 + 5000 - 2000 = 53000
        assertEquals(53000.0, netSalary, 0.001);
    }

    @Test
    public void testCalculateTax() {
        Payroll payroll = new Payroll();
        double tax = payroll.calculateTax(50000.0, 10.0);
        // Expected: 10% of 50000 = 5000
        assertEquals(5000.0, tax, 0.001);
    }
}