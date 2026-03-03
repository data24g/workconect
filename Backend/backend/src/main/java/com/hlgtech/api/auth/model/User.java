package com.hlgtech.api.auth.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    private Long numericId; // ID dạng số ngẫu nhiên

    private String username;

    @Email
    @NotBlank
    private String email;


    @NotBlank
    private String password;

    private String avatar;

    private String phone;

    private Role role;

    private LocalDateTime createdAt;

    private UserStatus status = UserStatus.ACTIVE;

    private double credibilityScore = 100;

    private String fullName;

    private String bio;

    private List<String> skills;

    private String education;

    private String certifications; // JSON: [{name, image}]

    private boolean isPremium = false;

    private boolean verified = false;

    private String location;

    private String industry;

    private String scale;

    private String established;
    private String taxCode;
    private String companyName;
    private String businessRegistrationCode;
    private String legalRepresentative;
    private String website;
    
    private boolean emailVerified = false;
    private boolean phoneVerified = false;
    private boolean idCardVerified = false;
    private VerificationStatus verificationStatus = VerificationStatus.NONE;

    private String badge;
    private String coverPhoto;
    private String dob;
    private String gender;
    private String address;
    private String title;
    private String description;

    private String idCardFrontImage;
    private String idCardBackImage;


    private Double rating = 0.0;     // Điểm trung bình (ví dụ: 4.5)
    private Integer ratingCount = 0; // Tổng số lượt đánh giá

    // User Stats
    private Integer profileViews = 0;
    private Integer postImpressions = 0;
    private Integer searchAppearances = 0;
    private Integer followersCount = 0;
    private Integer followingCount = 0;

    public Integer getFollowersCount() { return followersCount; }
    public void setFollowersCount(Integer followersCount) { this.followersCount = followersCount; }
    public Integer getFollowingCount() { return followingCount; }
    public void setFollowingCount(Integer followingCount) { this.followingCount = followingCount; }


    // Nếu không dùng Lombok (@Data), hãy nhấn Alt + Insert để tạo Getter/Setter cho 2 trường này
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getScale() {
        return scale;
    }

    public void setScale(String scale) {
        this.scale = scale;
    }

    public String getEstablished() {
        return established;
    }

    public void setEstablished(String established) {
        this.established = established;
    }

    public String getTaxCode() {
        return taxCode;
    }

    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getBusinessRegistrationCode() {
        return businessRegistrationCode;
    }

    public void setBusinessRegistrationCode(String businessRegistrationCode) {
        this.businessRegistrationCode = businessRegistrationCode;
    }

    public String getLegalRepresentative() {
        return legalRepresentative;
    }

    public void setLegalRepresentative(String legalRepresentative) {
        this.legalRepresentative = legalRepresentative;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isPhoneVerified() {
        return phoneVerified;
    }

    public void setPhoneVerified(boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public boolean isIdCardVerified() {
        return idCardVerified;
    }

    public void setIdCardVerified(boolean idCardVerified) {
        this.idCardVerified = idCardVerified;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getCertifications() {
        return certifications;
    }

    public void setCertifications(String certifications) {
        this.certifications = certifications;
    }

    public boolean isPremium() {
        return isPremium;
    }

    public void setPremium(boolean premium) {
        isPremium = premium;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public Integer getProfileViews() { return profileViews; }
    public void setProfileViews(Integer profileViews) { this.profileViews = profileViews; }

    public Integer getPostImpressions() { return postImpressions; }
    public void setPostImpressions(Integer postImpressions) { this.postImpressions = postImpressions; }

    public Integer getSearchAppearances() { return searchAppearances; }
    public void setSearchAppearances(Integer searchAppearances) { this.searchAppearances = searchAppearances; }

    public String getCoverPhoto() { return coverPhoto; }
    public void setCoverPhoto(String coverPhoto) { this.coverPhoto = coverPhoto; }
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIdCardFrontImage() { return idCardFrontImage; }
    public void setIdCardFrontImage(String idCardFrontImage) { this.idCardFrontImage = idCardFrontImage; }

    public String getIdCardBackImage() { return idCardBackImage; }
    public void setIdCardBackImage(String idCardBackImage) { this.idCardBackImage = idCardBackImage; }


    // ✅ Thêm trường mới cho thông tin đại lý
    // Trường này sẽ chỉ có dữ liệu khi role = AGENT


    // ... constructors & builder







    // Mã người giới thiệu
    public User(String id, String username, String email, String password, String phone, Role role, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        this.createdAt = createdAt;
    }

    public User() {
    }

    // ✅ Constructor private để chỉ builder gọi
    // ✅ Update constructor theo Builder
    private User(Builder builder) {
        this.id = builder.id;
        this.numericId = builder.numericId;

        this.username = builder.username;
        this.email = builder.email;
        this.password = builder.password;
        this.avatar = builder.avatar;
        this.fullName = builder.fullName;
        this.phone = builder.phone;
        this.role = builder.role != null ? builder.role : Role.USER;
        this.createdAt = builder.createdAt != null ? builder.createdAt : LocalDateTime.now();
        this.certifications = builder.certifications;
        this.website = builder.website;
        this.idCardFrontImage = builder.idCardFrontImage;
        this.idCardBackImage = builder.idCardBackImage;
    }



    // ✅ Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getNumericId() { return numericId; }
    public void setNumericId(Long numericId) { this.numericId = numericId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public double getCredibilityScore() {
        return credibilityScore;
    }

    public void setCredibilityScore(double credibilityScore) {
        this.credibilityScore = credibilityScore;
    }

    // ✅ Builder thủ công
    public static class Builder {
        private String id;
        private Long numericId;
        private String username;
        private String email;
        private String password;
        private String avatar;
        private String fullName;
        private String phone;
        private Role role;
        private LocalDateTime createdAt;
        private String refCode;        // Mã giới thiệu riêng (ví dụ: abc123)
        private String referrerCode;   // Mã người giới thiệu
        private BigDecimal balance;
        private String certifications; // Added
        private String website;
        private String idCardFrontImage;
        private String idCardBackImage;

        // ✅ Thêm trường agentDetails vào Builder

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder numericId(Long numericId) {
            this.numericId = numericId;
            return this;
        }

        // Thêm vào bên trong public static class Builder
        public Builder avatar(String avatar) {
            this.avatar = avatar;
            return this;
        }

        public Builder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }



        public Builder balance(BigDecimal balance) {
            this.balance = balance;
            return this;
        }

        public Builder refCode(String refCode){
            this.refCode = refCode;
            return this;
        }
        public Builder referrerCode(String referrerCode){
            this.referrerCode = referrerCode;
            return this;
        }


        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder password(String password) {
            this.password = password;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder role(Role role) {
            this.role = role;
            return this;
        }

        public Builder certifications(String certifications) {
            this.certifications = certifications;
            return this;
        }

        public Builder website(String website) {
            this.website = website;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder idCardFrontImage(String image) {
            this.idCardFrontImage = image;
            return this;
        }

        public Builder idCardBackImage(String image) {
            this.idCardBackImage = image;
            return this;
        }



        public User build() {
            return new User(this);
        }
    }

    // ✅ Khởi tạo builder
    public static Builder builder() {
        return new Builder();
    }



}