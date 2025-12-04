# 🎄 Joulun osaaja – Eduro

Leikkimielinen, jouluteemainen interaktiivinen kokemus Eduro-asiakkaille pikkujouluihin.

Tämä ei ole AI-demo.
Tämä on **hauska joululeikki**, jonka taustalla tekoäly auttaa luomaan henkilökohtaisen kokemuksen.

---

## 🎯 Tavoite

- Tarjota 1–2 minuutin mittainen, helppo ja turvallinen joulukokemus
- Jää mieleen ja naurattaa
- Antaa osallistujalle konkreettinen muisto:
  - **Joulun osaaja -todistus**, joka viedään kotiin

---

## 👥 Kohderyhmä

- Eduro-asiakkaat
- Pääosin alle 30-vuotiaat
- Maallikot, ei teknisiä taitovaatimuksia
- “Lapsen tasolle” sopiva: selkeä, visuaalinen, leikkimielinen

---

## 🧠 Kokemuksen perusidea

**Joulun osaaja – tonttukone**

Osallistuja:
1. Astuu pisteelle
2. Ottaa webkameralla kuvan
3. Saa tonttumaisen “jouluroolin”

Tulos:
- Tonttunimi
- Joulun osaaja -titteli
- Lyhyt humoristinen kuvaus
- **Satunnainen jouluvoima** (esim. +10 % joulumieltä)
- Fyysinen tulostettava todistus

---

## 🎲 Valitut lisäelementit

✅ **Satunnainen jouluvoima**  
- Kevyt humoristinen bonus
- Ei kilpailua
- Näkyy todistuksessa

✅ **Yhteinen edistymismittari**  
- “Tänään luodut Joulun osaajat: XX”
- Näkyy ruudulla koko ajan
- Tekee kokemuksesta yhteisen shown

---

## 🖥️ Käyttöympäristö

- Yksi läppäri
- Iso näyttö (HDMI)
- Piste, jolla host ohjaa tilannetta
- Yksi osallistuja kerrallaan

---

## 🖨️ Tulostus

- Todistus tulostetaan **automaattisesti verkkotulostimelle**
- Ei selaimen tulostusdialogia
- Tulostus tapahtuu erillisen backend-API:n kautta

---

## 🔐 Tietoturva ja yksityisyys

- Webkamerakuvaa **ei tallenneta pysyvästi**
- Kuvia ei lähetetä ulkopuolisille palveluille
- Kaikki AI-API-avaimet ovat backendissä ympäristömuuttujina
- Repossa ei säilytetä mitään salaisuuksia

---

## 🔑 Ympäristömuuttujat

Nämä ympäristömuuttujat vaaditaan:

- `OPENROUTER_API_KEY`
- `GEMINI_API_KEY` (valinnainen)
- `PRINT_API_TOKEN`

⚠️ Näitä ei koskaan lisätä repoon.

---

## 🧱 Arkkitehtuurin yleiskuva (korkea taso)

- Frontend:
  - HTML / CSS / JS
  - Webkamera
  - Kioskityylinen käyttöliittymä
- Backend:
  - AI-tekstigenerointi
  - Todistuksen PDF-generointi
  - Automaattitulostus verkkotulostimelle

---

## 🚧 Projektin tila

🔧 Kehitysvaiheessa  
Ensimmäinen tavoite: **toimiva demo pikkujouluihin 16.12**

---

## 🧭 Seuraavat askeleet

1. Frontend-runko (kamera + UI)
2. Backend-printti-API
3. AI-tekstien liittäminen
4. Visuaalinen viimeistely
