# ROADMAP

Šis ir dzīvs saraksts ar to, kas jāizdara, jāuzlabo, vai par ko vēl jāizlemj. Atzīmē `[x]`, kad kaut kas ir gatavs, pievieno jaunas idejas apakšā.

## Kur kas glabājas (konteksts)
- **MongoDB Atlas** - spēļu dati (nosaukums, apraksts, kategorijas, spēlētāju skaits/ilgums, vērtējumi), lietotāju konti
- **GitHub repo** (`public/images/`) - visi attēli, tieši faili, ~17MB šobrīd
- `ratingUsers` (`config/users.js`) - tikai hardkodēts vārdu saraksts vērtējumu atribūcijai, **nav** saistīts ar reāliem `User` kontiem

## Jau paveiktais (2026-09-09 sesija)
- [x] Kritiskie bugi (trūkstošais admin/games view, CSRF trūkumi, GET->POST rating delete)
- [x] Drošība (rate limiting, noņemts sensitīvs logging, MongoDB paroles rotācija)
- [x] Render sleep fix (UptimeRobot ping)
- [x] Koda tīrīšana (config/db.js dzēsts, CSS font-size, CSP dev bug)
- [x] Kauliņu (dice rating) atstarpes/wrap/mobile fix
- [x] Versijas numurs footerī (git commit hash, live)
- [x] Footer paraksta saite

## Lielie funkciju pieprasījumi (lietotāja saraksts)

### 1. Admin panelis - maksimālas iespējas
- [ ] Precizēt, kas tieši "max iespējas" nozīmē - saraksts ar konkrētām funkcijām (skat. zemāk, daļēji pārklājas ar citiem punktiem)

### 2. Reāli lietotāju konti ģimenes locekļiem
- Precizējums (2026-09-09): vērtējumi ir tīri no ģimenes locekļiem. Katrs loceklis dabū savu kontu, ielogojas pats un iedod savu vērtējumu. Admin var labot/dzēst jebkura cita vērtējumu pēc saviem ieskatiem (jau daļēji ir - admin toggle/delete pastāv `views/admin/users.ejs`, jāpārbauda vai tas sedz arī rating edit pēc admin, ne tikai paša autora).
- [ ] Katrs ģimenes loceklis dabū savu kontu (username+parole), ielogojas pats
- [ ] Vērtējums tiek piesaistīts ielogotajam kontam, nevis brīvi izvēlētam vārdam no saraksta (tagad `ratingUsers` array vairs nebūtu vajadzīgs, vai paliek kā fallback vieslietotājiem)
- [ ] Admin var labot/dzēst jebkuru vērtējumu neatkarīgi no autora (nevis tikai savu)
- [ ] Lēmums: vai admin izveido kontus (kā tagad ar `createUser.js`), vai ir arī pašu-reģistrācija ģimenes lokam

### 3. Labāki spēļu apraksti
- Izvēlētā pieeja (2026-09-09): BoardGameGeek (BGG) API kā datu avots
- [ ] BGG XML API integrācija: meklēt spēli pēc nosaukuma -> paņemt `description`, `minplayers`/`maxplayers`, `playingtime`, `minage`, kategorijas/mehānikas, attēlu
- [ ] **Review workflow admin panelī** (nevis automātiska pārrakstīšana): pēc pieprasījuma no BGG, katrs lauks (apraksts, spēlētāju skaits, ilgums u.c.) tiek parādīts blakus esošajai vērtībai admin panelī ar iespēju katru lauku atsevišķi **pieņemt** vai **noraidīt** - nekas netiek saglabāts DB, kamēr admin nav apstiprinājis
- [ ] Tulkošana: gan pati vietne (UI), gan no BGG iegūtā informācija (apraksti u.c.) jābūt pieejama **latviski un angliski**
  - UI teksts: i18n risinājums (piem. `i18n` npm pakotne vai vienkāršs paš-rakstīts key-value tulkojumu fails pa valodām), valodas pārslēgs kaut kur redzams (piem. header)
  - BGG dati (parasti angliski): pēc ielādes tulkot uz latviešu (kāds tulkošanas API, piem. DeepL free tier vai Google Translate API, vai AI-based tulkojums) un glabāt DB abas valodas (`description_lv`, `description_en` vai līdzīgi), admin var pēc tam roku labot tulkojumu review solī

### 4. Jaunu spēļu pievienošana (tikai admin puse pagaidām)
- [ ] Forma: nosaukums, apraksts, attēls(-i), kategorijas, spēlētāju skaits/ilgums u.c. strukturētie lauki
- [ ] Attēlu augšupielāde (nevis tikai ceļš uz jau eksistējošu failu) - saistīts ar 6. punktu (attēlu glabātuve)

### 5. Vairāki attēli per spēle + gluda galerija
- [ ] `Game` modelī `image: String` -> jākļūst par `images: [String]` (array)
- [ ] Frontend: carousel/lightbox komponente (Bootstrap Carousel der, vai kas vieglāks)
- [ ] Saistīts ar attēlu glabātuves jautājumu (skat. zemāk)

### 6. Tagu/kategoriju sakārtošana
- [ ] Pārskatīt esošo `category` sarakstu DB, saīsināt/apvienot pārklājošās kategorijas
- [ ] Vienota UI stila pieeja (badge/pill izskats, konsekventas krāsas)

### 7. "Spēles spēlēta" žurnāls (play log)
- [ ] Jauns modelis, piem. `PlaySession`: spēle (ref), datums (mandatory), dalībnieki (optional, multi-select no lietotājiem), ilgums minūtēs (optional), piezīmes (optional)
- [ ] UI: poga pie spēles "Atzīmēt kā spēlētu" -> ātra forma
- [ ] Vēlāk: statistikas lapa (populārākās spēles, pēdējoreiz spēlēts, kopējais spēlēšanas laiks) - šis balstās uz šo datu bāzi, tāpēc datu struktūra jāizdomā pareizi jau tagad, lai vēlāk nav jāmigrē

## Manis ieteiktais (lai atbilst mūsdienu standartiem)
- [ ] **Attēlu glabātuve mākonī** (Cloudinary/Backblaze B2/S3) - jau tagad 17MB repo, ar admin image upload + multi-image tas augs strauji. Git repo nav domāts bināru failu glabāšanai šādā apjomā, un Render build laiks/repo izmērs cietīs. Šis kļūst obligāts, tiklīdz taisa 4./5. punktu.
- [ ] **Testi** - šobrīd `npm test` ir tukšs stub. Vismaz pamata integration testi kritiskajiem flow (login, rating add/delete, admin CRUD)
- [ ] **CI** (GitHub Actions) - automātiski palaist testus/lint pie katra push, lai nesalauž main
- [ ] **Error monitoring** (Sentry bezmaksas tier) - lai redzētu produkcijas kļūdas, nevis paļautos uz Render logiem
- [ ] **Backups** MongoDB Atlas free tier (M0) nenodrošina automātiskus backupus - apsvērt periodisku manuālu/skriptotu export
- [ ] Input validācijas audits (`express-validator` jau ir atkarība, bet pārbaudīt, vai tiešām lietots visur, kur ir user input)

## Hosting/izmaksas - kad domāt par maksas plānu

**Šobrīdējais setup ir $0/mēnesī:**
- Render free web service (750h/mēnesī, pietiek 1 servisam nepārtraukti ar UptimeRobot ping)
- MongoDB Atlas M0 (bezmaksas, 512MB storage, koplietots RAM/CPU)
- GitHub bezmaksas (publisks repo)
- UptimeRobot bezmaksas

**Kad apsvērt maksas plānu:**
- Ja MongoDB dati (bez attēliem, tie jau tāpat glabājas ārpus DB) tuvojas 512MB - maz ticams tuvākajā laikā tekstadatiem, bet play log dati ar laiku var pieaugt
- Ja Render free tier kļūst par mazu (vairāk vienlaicīgu lietotāju, lēnāka atbilde) - Render Starter plāns ~$7/mēnesī, vienmēr aktīvs (bez keep-alive vajadzības), vairāk RAM/CPU
- Ja pāriet uz attēlu glabātuvi mākonī - Cloudinary bezmaksas tier (25 kredīti/mēnesī) parasti pietiek hobija projektam, Backblaze B2 ir pay-as-you-go, bet tik lēts (~$0.005/GB/mēnesī), ka mazam attēlu apjomam tas ir centi mēnesī

**Reālistiska aplēse, ja gribi "viss strādā gludi, ātri, bez kompromisiem" ģimenes mērogā (ne SaaS):**
~$7-10/mēnesī (Render Starter), viss pārējais paliek bezmaksas tieros limitos. Nav vajadzības pēc dārgākiem risinājumiem, kamēr tas paliek ģimenes projekts, nevis publisks SaaS (tas jau ir atsevišķš, lielāks lēmums, skat. CLAUDE.md "SaaS pivot" sadaļu).

## Atklātie jautājumi (jālemj pirms sākt kodēt)
- ~~Spēļu aprakstu avots~~ - izlemts: BGG API (skat. 3. punktu)
- ~~Vai vērtējumi ir tikai ģimenei~~ - jā, apstiprināts (skat. 2. punktu)
- Admin panelis - vai ir konkrētāks saraksts "max iespējām", vai iepriekš minētie punkti to sedz?
- Ģimenes reģistrācija - admin izveido, vai paši reģistrējas?
- Tulkošanas API izvēle (BGG datiem uz latviešu) - DeepL, Google Translate, vai AI-based? DeepL free tier (500k rakstzīmes/mēnesī) visdrīzāk pietiktu šim apjomam un dod labāku kvalitāti nekā Google Translate mazām valodām
