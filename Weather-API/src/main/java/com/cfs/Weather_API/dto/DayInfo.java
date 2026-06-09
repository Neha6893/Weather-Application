package com.cfs.Weather_API.dto;

public class DayInfo {
    private String date;
    private Double maxTemp;
    private Double minTemp;
    private Double avgTemp;

    public String getDate() {

        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Double getMaxTemp() {
        return maxTemp;
    }

    public void setMaxTemp(Double maxTemp) {
        this.maxTemp = maxTemp;
    }

    public Double getMinTemp() {
        return minTemp;
    }

    public void setMinTemp(Double minTemp) {
        this.minTemp = minTemp;
    }

    public Double getAvgTemp() {
        return avgTemp;
    }

    public void setAvgTemp(Double avgTemp) {
        this.avgTemp = avgTemp;
    }
}
