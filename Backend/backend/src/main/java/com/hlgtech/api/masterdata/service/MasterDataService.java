package com.hlgtech.api.masterdata.service;

import com.hlgtech.api.masterdata.dto.LocationDTO;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class MasterDataService {

    public List<LocationDTO> getLocations() {
        return Arrays.asList(
            new LocationDTO("Hà Nội", Arrays.asList("Ba Đình", "Hoàn Kiếm", "Cầu Giấy", "Đống Đa", "Hai Bà Trưng")),
            new LocationDTO("TP. Hồ Chí Minh", Arrays.asList("Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Thủ Đức")),
            new LocationDTO("Đà Nẵng", Arrays.asList("Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn")),
            new LocationDTO("Cần Thơ", Arrays.asList("Ninh Kiều", "Bình Thủy", "Cái Răng"))
        );
    }

    public List<String> getIndustries() {
        return Arrays.asList(
            "Công nghệ thông tin",
            "Marketing",
            "Xây dựng",
            "Tài chính - Ngân hàng",
            "Giáo dục",
            "Y tế",
            "Du lịch",
            "Sản xuất"
        );
    }
}
