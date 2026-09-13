<h1 align="center">
  <p>WhatsApp Translate Extension</p>
</h1>

<p>
  <img src="https://img.shields.io/badge/Release-Aug%202026-green">
  <img src="https://img.shields.io/github/stars/MateusPitura/extension-chrome-translate?style=social">
  <img src="https://img.shields.io/badge/OS-Android-red">  
</p>

## Description

Translate WhatsApp Web messages directly in your browser without leaving the conversation. This Chrome extension adds a translation button to each message and a composer shortcut to translate custom text using a backend translation service. There is also a React Native app that allows you to translate messages on your Android device

- [Features](#features)
- [How to Run](#how-to-run)
- [Technologies Used](#technologies-used)
- [Authors](#authors)

## Features

🔤 **Inline translation:** a button beside WhatsApp messages

📝 **Composer translation:** translation input in the message composer

📱 **Android App:** a web view that loads WhatsApp Web with the extension injected

## How to Run

**For devs:**

### Chrome Extension

1. Navigate to the `extension/` folder and install dependencies with `npm i`

2. Run `npm run dev` to serve the extension assets locally

3. Build the project with `npm run build:extension`

4. Open the Extensions tab in Chrome, enable `Developer mode`, and load the generated `dist/` folder as an unpacked extension

### React Native App

1. Navigate to the `app/` folder and install dependencies with `npm i`

2. Run `npm run start` to start the Expo development server

3. Use the Expo Go app on your Android device to scan the QR code and run the app

4. To build the Android app, run `npm run build:android`

## Technologies Used

<!--Link for badges: https://github.com/Ileriayo/markdown-badges -->

<p align="left">
	<img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript"/>
  <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white" alt="Cloudflare"/>
  <img src="https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="ReactNative"/>
  <img src="https://img.shields.io/badge/expo-%231C1E24.svg?style=for-the-badge&logo=expo&logoColor=#D04A37" alt="Expo"/>
</p>

## Authors

| Mateus Pitura                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <p align="center"><img src="https://avatars.githubusercontent.com/u/119008106" width="100" height="100"></p>                                                                          |
| <a href="https://url.mateuspitura.com?q=linkedin.com/in/mateuspitura/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a> |
