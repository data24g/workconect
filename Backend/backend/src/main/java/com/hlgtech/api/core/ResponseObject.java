package com.hlgtech.api.core;


public class ResponseObject {
    private int success;
    private Object data;
    private String message;

    public ResponseObject() {
    }

    public ResponseObject(int success, Object data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }

    public int getSuccess() {
        return success;
    }

    public void setSuccess(int success) {
        this.success = success;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
