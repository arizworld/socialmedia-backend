import express from "express";
import request from "supertest";
import bcrypt from "bcrypt";
import crypto from "crypto";
import App from "../../App";
import UserServices from "../../model/user.model";
import PostServices from "../../model/post.model";
import CommentServices from "../../model/comments.model";
import { upload } from "../../middleware/upload.middleware";
import path from "path";
jest.mock("../../utils/mailer", () => async () => true);
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
let encryptedResetToken;
let resetToken;
const createUserResponse = {
  username: "rando",
  email: "randomuser3@gmail.com",
  password: "$2b$10$oBz31PzJi/by0gdaGBYNvuayQF91dFpcR5JpQg9rtKrPKV3j6wtea",
  _id: "62e0cbd665b54e6a480db0ed",
  __v: 0,
  image: {
    data: "",
    url: "",
  },
  blockedAccessTokens: [],
  getToken: () => "jlskjflskythlhlkhs",
  comparePassword: async (password) =>
    await bcrypt.compare(
      password,
      "$2b$10$oBz31PzJi/by0gdaGBYNvuayQF91dFpcR5JpQg9rtKrPKV3j6wtea"
    ),
  save: async () => Promise.resolve("1"),
  getResetToken: async function (resetDelay: number) {
    resetToken = crypto.randomBytes(20).toString("hex");
    encryptedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    return resetToken;
  },
  destroyResetToken: jest.fn(),
};
const deletePostResults = [
  {
    _id: "62d68431c66b1193baf90df7",
    title: "test post 1",
    description:
      "skdjfhsdhfkjsdhfksdhfsdhfiusdhfiusdhfihsdifuhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
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
    description:
      "skdjfhsdhfkjsdhfksdhfsdhfiusdhfiusdhfihsdifuhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
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
const authorization = {
  Authorization:
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyZTEyYWY3MWM0NzhhZTNmYmM5MjBiMSIsImlhdCI6MTY1ODk4NDMzMn0.L1DOUKJmxSPr-0-NRUtofK1_6746Zg8U5ZaRSyeKPTs",
};
const imagePath = path.join(__dirname, "../images/aritra.hiring.JPEG");
const textPath = path.join(__dirname, "../images/cred.txt");
console.log(imagePath);
let app: express.Application;
beforeAll(() => {
  app = new App().getInstance();
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
      it("should resgister new user", async () => {
        const UserFindMock = jest
          .spyOn(UserServices, "findOne")
          .mockResolvedValueOnce(null);
        const UserCreateMock = jest
          .spyOn(UserServices, "create") //  @ts-ignore
          .mockResolvedValueOnce({ ...createUserResponse });
        const response = await request(app)
          .post("/api/v1/user")
          .set(apikey)
          .send(validUserInput);
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
    describe("given invalid input", () => {
      it("it should handle error", async () => {
        const UserFindMock = jest
          .spyOn(UserServices, "findOne")
          .mockResolvedValueOnce(null);
        const UserCreateMock = jest
          .spyOn(UserServices, "create") //  @ts-ignore
          .mockResolvedValueOnce({ ...createUserResponse });
        const response = await request(app)
          .post("/api/v1/user")
          .set(apikey)
          .send(InvalidUserInput);
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/cannot be empty/);
      });
    });
    describe("given already existing email", () => {
      it("should return error email already exists", async () => {
        const UserFindMock = jest
          .spyOn(UserServices, "findOne") // @ts-ignore
          .mockResolvedValueOnce({ ...createUserResponse });
        const UserCreateMock = jest
          .spyOn(UserServices, "create") //  @ts-ignore
          .mockResolvedValueOnce({ ...createUserResponse });
        const response = await request(app)
          .post("/api/v1/user")
          .set(apikey)
          .send(validUserInput);
        expect(response.status).toBe(409);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/email already exists/);
      });
    });
  });
  describe("login", () => {
    describe("given valid credentials", () => {
      it("should login user", async () => {
        const UserFindMock = jest
          .spyOn(UserServices, "findOne") // @ts-ignore
          .mockResolvedValueOnce({ ...createUserResponse });
        const response = await request(app)
          .post("/api/v1/user/login")
          .set(apikey)
          .send(validLoginInput);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
    describe("given invalid credentials", () => {
      it("should not log in user", async () => {
        const UserFindMock = jest
          .spyOn(UserServices, "findOne") // @ts-ignore
          .mockResolvedValueOnce({ ...createUserResponse });
        const response = await request(app)
          .post("/api/v1/user/login")
          .set(apikey)
          .send(invalidLoginInput);
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });
  });
  describe("delete account", () => {
    describe("given valid token", () => {
      it("should delete user account and all his posts and comments", async () => {
        jest.useFakeTimers();
        const findByIdAndSelectMock = jest
          .spyOn(UserServices, "findByIdAndSelect") // @ts-ignore
          .mockResolvedValue({ ...createUserResponse });
        const userFindByIdMock = jest
          .spyOn(UserServices, "findById") // @ts-ignore
          .mockResolvedValueOnce({ ...createUserResponse });
        const userDeleteMock = jest
          .spyOn(UserServices, "delete") // @ts-ignore
          .mockResolvedValueOnce({ ...createUserResponse });
        const postFindMock = jest
          .spyOn(PostServices, "find") //@ts-ignore
          .mockReturnValueOnce(deletePostResults);
        const postDeleteManyMock = jest
          .spyOn(PostServices, "deleteMany")
          .mockResolvedValueOnce({ acknowledged: true, deletedCount: 1 });
        const commentDeleteManyMock = jest
          .spyOn(CommentServices, "deleteMany")
          .mockResolvedValue({ acknowledged: true, deletedCount: 1 });
        const response = await request(app)
          .delete("/api/v1/user")
          .set({ ...apikey, ...authorization });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(PostServices.deleteMany).toHaveBeenCalledTimes(1);
        expect(PostServices.deleteMany).toHaveBeenNthCalledWith(1, {
          author: createUserResponse._id,
        });
        expect(CommentServices.deleteMany).toHaveBeenNthCalledWith(1, {
          postId: deletePostResults[0]._id,
        });
        expect(CommentServices.deleteMany).toHaveBeenNthCalledWith(2, {
          postId: deletePostResults[1]._id,
        });
        expect(CommentServices.deleteMany).toHaveBeenNthCalledWith(3, {
          author: createUserResponse._id,
        });
        expect(CommentServices.deleteMany).toHaveBeenCalledTimes(3);
      });
    });
  });
  describe("logout", () => {
    describe(" given valid token ", () => {
      it("should be able to logout", async () => {
        const userFindByIdMock = jest
          .spyOn(UserServices, "findByIdAndSelect") // @ts-ignore
          .mockResolvedValue({ ...createUserResponse });
        const response = await request(app)
          .post("/api/v1/user/logout")
          .set({ ...apikey, ...authorization });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: true,
          message: "See you soon...",
        });
      });
    });
    describe(" given invalid token ", () => {
      it("should not be able to logout", async () => {
        const userFindByIdMock = jest
          .spyOn(UserServices, "findByIdAndSelect") // @ts-ignore
          .mockResolvedValue(null);
        const response = await request(app)
          .post("/api/v1/user/logout")
          .set({ ...apikey, ...authorization });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: "Invalid credentials",
        });
      });
    });
  });
  describe("forgetpassword", () => {
    describe("given valid email", () => {
      it("should email user the reset urls", async () => {
        const userFindOneMock = jest
          .spyOn(UserServices, "findOne") //@ts-ignore
          .mockResolvedValueOnce({ ...createUserResponse });
        const response = await request(app)
          .post("/api/v1/user/forgetpassword")
          .set(apikey)
          .send({ email: "testemail101@gmail.com" });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
    describe("given invalid email", () => {
      it("should handle error", async () => {
        const userFindOneMock = jest
          .spyOn(UserServices, "findOne") //@ts-ignore
          .mockResolvedValueOnce(null);
        const response = await request(app)
          .post("/api/v1/user/forgetpassword")
          .set(apikey)
          .send({ email: "testemail101@gmail.com" });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch("User not found");
      });
    });
  });
  describe("reset password", () => {
    describe("given right token", () => {
      it("should reset user's password", async () => {
        const findOneMock = jest
          .spyOn(UserServices, "findOne") // @ts-ignore
          .mockImplementationOnce(async (query) => {
            if (encryptedResetToken === query.resetToken) {
              return createUserResponse;
            }
            return null;
          });
        const response = await request(app)
          .put(`/api/v1/user/resetpassword/${resetToken}`)
          .set(apikey)
          .send({ password: "password", confirmPassword: "password" });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
    describe("given wrong token", () => {
      it("should handle error", async () => {
        const findOneMock = jest
          .spyOn(UserServices, "findOne") // @ts-ignore
          .mockImplementationOnce(async (query) => {
            if (encryptedResetToken === query.resetToken) {
              return createUserResponse;
            }
            return null;
          });
        const response = await request(app)
          .put(`/api/v1/user/resetpassword/wrongtoken`)
          .set(apikey)
          .send({ password: "password", confirmPassword: "password" });
        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/Invalid reset token/);
      });
    });
  });
});
