"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const App_1 = __importDefault(require("../../App"));
const user_model_1 = __importDefault(require("../../model/user.model"));
const post_model_1 = __importDefault(require("../../model/post.model"));
const comments_model_1 = __importDefault(require("../../model/comments.model"));
const validUserInput = {
    username: "rando",
    email: "randomuser2@gmail.com",
    password: "strongpassword",
};
const validLoginInput = {
    email: "randomuser2@gmail.com",
    password: "strongpassword",
};
const InvalidUserInput = {
    username: "",
    email: "randomuser2@gmail.com",
    password: "strongpassword",
};
const invalidLoginInput = {
    email: "randomuser2@gmail.com",
    password: "wrongpassowrd",
};
const createUserResponse = {
    username: "rando",
    email: "randomuser3@gmail.com",
    password: "$2b$10$oBz31PzJi/by0gdaGBYNvuayQF91dFpcR5JpQg9rtKrPKV3j6wtea",
    _id: "62e0cbd665b54e6a480db0ed",
    __v: 0,
    getToken: () => "jlskjflskythlhlkhs",
    comparePassword: (password) => __awaiter(void 0, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, "$2b$10$oBz31PzJi/by0gdaGBYNvuayQF91dFpcR5JpQg9rtKrPKV3j6wtea");
    }),
};
const deletePostResults = [
    {
        _id: "62d68431c66b1193baf90df7",
        title: "test post 1",
        description: "skdjfhsdhfkjsdhfksdhfsdhfiusdhfiusdhfihsdifuhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
        author: "62d683d17bc23f17bccb3162",
        authorname: "aritra op",
        media: [
            {
                mediaRef: "62d68430c66b1193baf90df2",
                mediaUrl: "http://localhost:1020/post/62d68430c66b1193baf90df2/media",
                _id: "62d68431c66b1193baf90df8",
            },
            {
                mediaRef: "62d68430c66b1193baf90df3",
                mediaUrl: "http://localhost:1020/post/62d68430c66b1193baf90df3/media",
                _id: "62d68431c66b1193baf90df9",
            },
        ],
        likes: [],
        likecount: 0,
        tags: ["love", "wisdom"],
        createdAt: "2022-07-19T10:15:13.082Z",
        updatedAt: "2022-07-19T10:15:13.082Z",
        __v: 0,
    },
    {
        _id: "62d94ef984e7c184d0a0cfc1",
        title: "jfddgdfg",
        description: "skdjfhsdhfkjsdhfksdhfsdhfiusdhfiusdhfihsdifuhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
        author: "62d683d17bc23f17bccb3162",
        authorname: "aritra op",
        media: [],
        likes: [
            {
                reactionType: "care",
                authorId: "62de52f140327b2c63fb15a9",
                authorname: "rando",
                _id: "62de7a94f4966aa4afce2dc5",
            },
        ],
        likecount: 1,
        tags: ["love", "wisdom"],
        createdAt: "2022-07-21T13:04:57.627Z",
        updatedAt: "2022-07-25T11:20:57.501Z",
        __v: 0,
    },
];
const apikey = {
    apikey: "4fcc807ead48669c976b",
};
const Authorization = {
    Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyZTEyYWY3MWM0NzhhZTNmYmM5MjBiMSIsImlhdCI6MTY1ODk4NDMzMn0.L1DOUKJmxSPr-0-NRUtofK1_6746Zg8U5ZaRSyeKPTs",
};
const serverResponse = {
    success: true,
    user: {
        username: "rando",
        email: "randomuser3@gmail.com",
        password: "$2b$10$oBz31PzJi/by0gdaGBYNvuayQF91dFpcR5JpQg9rtKrPKV3j6wtea",
        _id: "62e0cbd665b54e6a480db0ed",
        __v: 0,
    },
    message: "User created successfully.Please login to continue.",
};
let app;
beforeAll(() => {
    app = new App_1.default().getInstance();
});
beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
});
afterEach(() => {
    jest.useRealTimers();
});
describe("user", () => {
    describe("sign up", () => {
        describe("given valid user input", () => {
            it("should resgister new user", () => __awaiter(void 0, void 0, void 0, function* () {
                const UserFindMock = jest
                    .spyOn(user_model_1.default, "findOne")
                    .mockResolvedValueOnce(null);
                const UserCreateMock = jest
                    .spyOn(user_model_1.default, "create") //  @ts-ignore
                    .mockResolvedValueOnce(createUserResponse);
                const response = yield (0, supertest_1.default)(app)
                    .post("/api/v1/user")
                    .set(apikey)
                    .send(validUserInput);
                expect(response.status).toBe(201);
                expect(response.body).toEqual(serverResponse);
            }));
        });
        describe("given invalid input", () => {
            it("it should handle error", () => __awaiter(void 0, void 0, void 0, function* () {
                const UserFindMock = jest
                    .spyOn(user_model_1.default, "findOne")
                    .mockResolvedValueOnce(null);
                const UserCreateMock = jest
                    .spyOn(user_model_1.default, "create") //  @ts-ignore
                    .mockResolvedValueOnce(createUserResponse);
                const response = yield (0, supertest_1.default)(app)
                    .post("/api/v1/user")
                    .set(apikey)
                    .send(InvalidUserInput);
                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toMatch(/cannot be empty/);
            }));
        });
        describe("given already existing email", () => {
            it("should return error email already exists", () => __awaiter(void 0, void 0, void 0, function* () {
                const UserFindMock = jest
                    .spyOn(user_model_1.default, "findOne") // @ts-ignore
                    .mockResolvedValueOnce(createUserResponse);
                const UserCreateMock = jest
                    .spyOn(user_model_1.default, "create") //  @ts-ignore
                    .mockResolvedValueOnce(createUserResponse);
                const response = yield (0, supertest_1.default)(app)
                    .post("/api/v1/user")
                    .set(apikey)
                    .send(validUserInput);
                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toMatch(/email already exists/);
            }));
        });
    });
    describe("login", () => {
        describe("given valid credentials", () => {
            it("should login user", () => __awaiter(void 0, void 0, void 0, function* () {
                const UserFindMock = jest
                    .spyOn(user_model_1.default, "findOne") // @ts-ignore
                    .mockResolvedValueOnce(createUserResponse);
                const response = yield (0, supertest_1.default)(app)
                    .post("/api/v1/user/login")
                    .set(apikey)
                    .send(validLoginInput);
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            }));
        });
        describe("given invalid credentials", () => {
            it("should not log in user", () => __awaiter(void 0, void 0, void 0, function* () {
                const UserFindMock = jest
                    .spyOn(user_model_1.default, "findOne") // @ts-ignore
                    .mockResolvedValueOnce(createUserResponse);
                const response = yield (0, supertest_1.default)(app)
                    .post("/api/v1/user/login")
                    .set(apikey)
                    .send(invalidLoginInput);
                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
            }));
        });
    });
    describe("logout", () => {
        describe(" given valid token ", () => {
            it("should be able to logout", () => __awaiter(void 0, void 0, void 0, function* () {
                const userFindByIdMock = jest
                    .spyOn(user_model_1.default, "findById") // @ts-ignore
                    .mockResolvedValueOnce(createUserResponse);
                const response = yield (0, supertest_1.default)(app)
                    .post("/api/v1/user/logout")
                    .set(Object.assign(Object.assign({}, apikey), Authorization));
                expect(response.status).toBe(200);
                expect(response.body).toEqual({
                    success: true,
                    message: "See you soon...",
                });
            }));
        });
        describe(" given invalid token ", () => {
            it("should not be able to logout", () => __awaiter(void 0, void 0, void 0, function* () {
                const userFindByIdMock = jest
                    .spyOn(user_model_1.default, "findById") // @ts-ignore
                    .mockResolvedValueOnce(null);
                const response = yield (0, supertest_1.default)(app)
                    .post("/api/v1/user/logout?apikey=4fcc807ead48669c976b")
                    .set(Object.assign(Object.assign({}, apikey), Authorization));
                expect(response.status).toBe(400);
                expect(response.body).toEqual({
                    success: false,
                    message: "Invalid credentials",
                });
            }));
        });
    });
    describe("delete account", () => {
        describe("given valid token", () => {
            it("should delete user account and all his posts and comments", () => __awaiter(void 0, void 0, void 0, function* () {
                jest.useFakeTimers();
                const userFindByIdMock = jest
                    .spyOn(user_model_1.default, "findById") // @ts-ignore
                    .mockResolvedValueOnce(createUserResponse);
                const userDeleteMock = jest
                    .spyOn(user_model_1.default, "delete") // @ts-ignore
                    .mockResolvedValueOnce(createUserResponse);
                const postFindMock = jest
                    .spyOn(post_model_1.default, "find") //@ts-ignore
                    .mockReturnValueOnce(deletePostResults);
                const postDeleteManyMock = jest
                    .spyOn(post_model_1.default, "deleteMany")
                    .mockResolvedValueOnce({ acknowledged: true, deletedCount: 1 });
                const commentDeleteManyMock = jest
                    .spyOn(comments_model_1.default, "deleteMany")
                    .mockResolvedValue({ acknowledged: true, deletedCount: 1 });
                const response = yield (0, supertest_1.default)(app)
                    .delete("/api/v1/user?apikey=4fcc807ead48669c976b")
                    .set(Object.assign(Object.assign({}, apikey), Authorization));
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(post_model_1.default.deleteMany).toHaveBeenCalledTimes(1);
                expect(post_model_1.default.deleteMany).toHaveBeenNthCalledWith(1, {
                    author: createUserResponse._id,
                });
                expect(comments_model_1.default.deleteMany).toHaveBeenNthCalledWith(1, {
                    postId: deletePostResults[0]._id,
                });
                expect(comments_model_1.default.deleteMany).toHaveBeenNthCalledWith(2, {
                    postId: deletePostResults[1]._id,
                });
                expect(comments_model_1.default.deleteMany).toHaveBeenNthCalledWith(3, {
                    author: createUserResponse._id,
                });
                expect(comments_model_1.default.deleteMany).toHaveBeenCalledTimes(3);
            }));
        });
    });
});
//# sourceMappingURL=user.test.js.map