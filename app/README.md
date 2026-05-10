# Calculadora Científica — React Native (Expo)

## Pré-requisitos

- [Node.js 18+](https://nodejs.org)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

```bash
npm install -g expo-cli
```

## Instalar e rodar

```bash
cd app
npm install
npx expo start
```

Depois escaneie o QR code com o app **Expo Go** no celular (Android ou iOS).

## Rodar no emulador

```bash
# Android
npx expo start --android

# iOS (Mac apenas)
npx expo start --ios
```

## Gerar APK/AAB para produção

```bash
npx eas build --platform android
```

## Funcionalidades

- sin, cos, tan, asin, acos, atan (com toggle DEG/RAD)
- log, ln, log₂
- √, x², xʸ, 1/x, |x|
- n! (fatorial)
- π e e
- Vibração tátil nos botões
- Display com preview em tempo real
