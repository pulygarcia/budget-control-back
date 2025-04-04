import nodemailer from 'nodemailer';

type Transport = {
  host: string | undefined;
  port: number;
  secure?: boolean;
  auth: {
    user: string | undefined;
    pass: string | undefined;
  };
};

const transport: Transport = {
  host: process.env.NODEMAILER_HOST,
  port: Number(process.env.NODEMAILER_PORT),
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD
  }
};

export const transporter = nodemailer.createTransport(transport);