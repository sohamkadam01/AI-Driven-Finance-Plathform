package com.College_project.project.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum InvestmentType {
    STOCK,
    MUTUAL_FUND,
    FIXED_DEPOSIT,
    GOLD,
    REAL_ESTATE,
    BOND,
    CRYPTO,
    ETF,
    OTHER;

    @JsonCreator
    public static InvestmentType fromValue(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().toUpperCase();
        if ("BONDS".equals(normalized)) {
            return BOND;
        }

        return InvestmentType.valueOf(normalized);
    }
}
