import axios from "axios";

// axios.defaults.baseURL = "https://next-docs-9f0504b0a741.herokuapp.com";
// axios.defaults.baseURL = "http://localhost:3000/api";

export const nextServer = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // дозволяє axios працювати з cookie
});

// export type Note = {
//   id: string;
//   title: string;
//   content: string;
//   categoryId: string;
//   userId: string;
//   createdAt: string;
//   updatedAt: string;
// };

// export type Category = {
//   id: string;
//   name: string;
//   description: string;
//   createdAt: string;
//   updatedAt: string;
// };

// export type NoteListResponse = {
//   notes: Note[];
//   total: number;
// };

// export type NewNoteData = {
//   title: string;
//   content: string;
//   categoryId: string;
// };

// export const getNotes = async (categoryId?: string) => {
//   const res = await nextServer.get<NoteListResponse>("/notes", {
//     params: { categoryId },
//   });
//   return res.data;
// };

// export const getSingleNote = async (id: string) => {
//   const res = await nextServer.get<Note>(`/notes/${id}`);
//   return res.data;
// };

// export const getCategories = async () => {
//   const res = await nextServer.get<Category[]>("/categories");
//   return res.data;
// };

// export const createNote = async (data: NewNoteData) => {
//   const res = await nextServer.post<Note>("/notes", data);
//   return res.data;
// };

// export type RegisterRequest = {
//   email: string;
//   password: string;
//   userName: string;
// };

// export type User = {
//   id: string;
//   email: string;
//   userName?: string;
//   photoUrl?: string;
//   createdAt: Date;
//   updatedAt: Date;
// };

// export const register = async (data: RegisterRequest) => {
//   const res = await nextServer.post<User>("/auth/register", data);
//   return res.data;
// };

// export type LoginRequest = {
//   email: string;
//   password: string;
// };

// export const login = async (data: LoginRequest) => {
//   const res = await nextServer.post<User>("/auth/login", data);
//   return res.data;
// };

// type CheckSessionRequest = {
//   success: boolean;
// };

// export const checkSession = async () => {
//   const res = await nextServer.get<CheckSessionRequest>("/auth/session");
//   return res.data.success;
// };

// export const getMe = async () => {
//   const { data } = await nextServer.get<User>("/auth/me");
//   return data;
// };

// export const logout = async (): Promise<void> => {
//   await nextServer.post("/auth/logout");
// };
