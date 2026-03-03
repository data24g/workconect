package com.hlgtech.api.masterdata.dto;

import java.util.List;

public class LocationDTO {
    private String province;
    private List<String> districts;

    public LocationDTO(String province, List<String> districts) {
        this.province = province;
        this.districts = districts;
    }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public List<String> getDistricts() { return districts; }
    public void setDistricts(List<String> districts) { this.districts = districts; }
}
