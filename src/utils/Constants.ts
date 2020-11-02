const APIErrors = {
    UNKNOWN_ERROR: {
        code: 10001,
        error: "Unknown error",
        httpStatus: 500
    },
    UNKNOWN_USER: {
        code: 10002,
        error: "User not found",
        httpStatus: 404
    },
    UNKNOWN_PASTE: {
        code: 10003,
        error: "Paste not found",
        httpStatus: 404
    },
    UNAUTHENTICATED: {
        code: 20001,
        error: "Unauthenticated",
        httpStatus: 401
    },
    UNAUTHORIZED: {
        code: 20002,
        error: "You don't have permission to do that",
        httpStatus: 403
    },
    INVALID_FORM_BODY: {
        code: 30001,
        error: "Invalid form body",
        httpStatus: 400
    },
    PRECONDITION_FAILED: {
        code: 40001,
        error: "You're not able to do that",
        httpStatus: 412
    },
    RESOURCE_DELETED: {
        code: 40002,
        error: "That resource has been deleted",
        httpStatus: 410
    }
}

export {
    APIErrors
};