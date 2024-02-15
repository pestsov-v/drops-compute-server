import { EventEmitter } from "events";
import os from "os";
import fs from "fs";
import path from "path";
import async_hooks from "async_hooks";
import crypto from "crypto";
import http from "http";
import https from "https";

import { injectable, inject, ContainerModule, Container } from "inversify";
import { format } from "date-fns";
import winston from "winston";
import fse from "fs-extra";
import colors from "colors";
import fastify from "fastify";
import express from "express";
import { v4 } from "uuid";
import mongoose from "mongoose";
import { DataSource, EntitySchema } from "typeorm";
import ioredis from "ioredis";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import ws from "ws";
import querystring from "querystring";
// @ts-ignore
import openapiValidator from "openapi-schema-validator";

export { querystring };

export {
  AbstractDiscoveryService,
  IAbstractDiscoveryService,
} from "@chaminjector/seeds-discovery-service";

export class Packages {
  public static get inversify() {
    return {
      injectable,
      inject,
      ContainerModule,
      Container,
    };
  }

  public static get events() {
    return { EventEmitter };
  }

  public static get async_hooks() {
    return {
      AsyncLocalStorage: async_hooks.AsyncLocalStorage,
    };
  }

  public static get os() {
    return { os };
  }

  public static get fs() {
    return {
      fsp: fs.promises,
      fs: fs,
      fse: fse,
    };
  }

  public static get path() {
    return {
      path,
    };
  }

  public static get winston() {
    return {
      winston,
      format: winston.format,
      Logger: winston.Logger,
      transports: winston.transports,
    };
  }

  public static get colors() {
    return { colors };
  }

  public static get dateFns() {
    return {
      format: format,
    };
  }

  public static get fastify() {
    return { fastify };
  }

  public static get express() {
    return { express };
  }

  public static get uuid() {
    return { v4 };
  }

  public static get mongoose() {
    return {
      mongoose,
      Schema: mongoose.Schema,
    };
  }

  public static get typeorm() {
    return { DataSource, EntitySchema };
  }

  public static get ioredis() {
    return { ioredis };
  }

  public static get jwt() {
    return { jwt };
  }

  public static get bcrypt() {
    return { bcrypt };
  }

  public static get crypto() {
    return { crypto };
  }

  public static get nodemailer() {
    return { nodemailer };
  }

  public static get http() {
    return { http };
  }

  public static get https() {
    return { https };
  }

  public static get ws() {
    return { ws };
  }

  public static get openapi() {
    return { Validator: openapiValidator };
  }
}
