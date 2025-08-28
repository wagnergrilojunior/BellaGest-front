import { bellagestClient } from './bellagestClient';

// Placeholder para integrações - podem ser implementadas depois
export const Core = {
  InvokeLLM: () => Promise.resolve({ message: "LLM integration not implemented yet" }),
  SendEmail: () => Promise.resolve({ message: "Email integration not implemented yet" }),
  UploadFile: bellagestClient.uploadFile,
  GenerateImage: () => Promise.resolve({ message: "Image generation not implemented yet" }),
  ExtractDataFromUploadedFile: () => Promise.resolve({ message: "Data extraction not implemented yet" })
};

export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;






