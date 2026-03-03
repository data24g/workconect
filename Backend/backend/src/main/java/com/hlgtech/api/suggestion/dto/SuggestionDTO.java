package com.hlgtech.api.suggestion.dto;

public class SuggestionDTO {
    private String id;
    private String name;
    private String avatar;
    private String role;
    private Integer mutualConnections;
    private SuggestionType type;
    private Long numericId;

    public SuggestionDTO() {}

    public SuggestionDTO(String id, String name, String avatar, String role, Integer mutualConnections, SuggestionType type, Long numericId) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.role = role;
        this.mutualConnections = mutualConnections;
        this.type = type;
        this.numericId = numericId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Integer getMutualConnections() { return mutualConnections; }
    public void setMutualConnections(Integer mutualConnections) { this.mutualConnections = mutualConnections; }

    public SuggestionType getType() { return type; }
    public void setType(SuggestionType type) { this.type = type; }

    public Long getNumericId() { return numericId; }
    public void setNumericId(Long numericId) { this.numericId = numericId; }
}
