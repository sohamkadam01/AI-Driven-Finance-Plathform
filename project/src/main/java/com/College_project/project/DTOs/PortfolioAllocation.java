package com.College_project.project.DTOs;

import java.math.BigDecimal;

/**
 * DTO representing an asset class allocation within an investment portfolio.
 */
public class PortfolioAllocation {
    private String assetClass;
    private BigDecimal percentage;
    private String examples;

    public PortfolioAllocation() {
    }

    public PortfolioAllocation(String assetClass, BigDecimal percentage, String examples) {
        this.assetClass = assetClass;
        this.percentage = percentage;
        this.examples = examples;
    }

    public String getAssetClass() {
        return assetClass;
    }

    public void setAssetClass(String assetClass) {
        this.assetClass = assetClass;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }

    public String getExamples() {
        return examples;
    }

    public void setExamples(String examples) {
        this.examples = examples;
    }
}