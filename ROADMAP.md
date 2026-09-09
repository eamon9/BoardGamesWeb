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
- [x] 2. punkts: reāli lietotāju konti + vērtējumu piesaiste kontam (skat. detaļas zemāk)
- [x] Bonus fix: CSRF/error page crash (footer izmantoja `appVersion`, kas nebija pieejams, kad `csrf()` middleware izmeta kļūdu pirms tā tika iestatīts - atklāts, testējot reālu rating flow)
- [x] Admin var izveidot lietotājus caur UI (`/admin/users`) ar pagaidu paroli, nevis tikai CLI skriptu
- [x] Admin var atiestatīt jebkura lietotāja paroli caur UI
- [x] Admin var rediģēt jebkura lietotāja username/displayName caur UI (ja rediģē savu paša kontu, sesija atjaunojas uzreiz, nav jārelogojas)
- [x] Profila lapa: lietotājs pats var iestatīt dzimšanas datumu un nomainīt paroli (nav obligāti pēc admin atiestatīšanas, tikai maigs atgādinājums)
- [x] Vecums vērtējumos tagad rēķinās automātiski no dzimšanas datuma (nevis manuāli rakstīts teksts), redzams uzreiz līdzās vārdam

## Lielie funkciju pieprasījumi (lietotāja saraksts)

### 1. Admin panelis - maksimālas iespējas
- [x] Lietotāju izveide caur UI ar pagaidu paroli (`/admin/users`, 2026-09-09)
- [x] Paroles atiestatīšana jebkuram lietotājam caur UI
- [x] Username/displayName rediģēšana jebkuram lietotājam caur UI
- [x] Fix (2026-09-10): lietotājs nevarēja rediģēt savu vērtējumu - `routes/index.js` `.populate("ratings.userId", ...)` aizvietoja `rating.userId` ar pilnu objektu, `game.ejs` salīdzināja `String(objekts)` ("[object Object]") pret lietotāja ID, nekad nesakrita
- [x] Admin panelis (`/admin/users`) un profila lapa: skaidrāki paskaidrojumi (username vs displayName vs parole), tabula `.table-responsive` mobilajam skatam
- [x] Admin lietotāju saraksts pārtaisīts no cieša tabulas rindu izkārtojuma uz karšu (card) izkārtojumu - katram lietotājam sava karte ar skaidri nodalītām sadaļām (vārda maiņa / paroles atiestatīšana / admin tiesības / dzēst), dabiski sakrājas vienā kolonnā mobilajā, dzēšanai pievienots apstiprinājuma dialogs
- [x] Fix (2026-09-10): login redirect vienmēr aizveda uz mājaslapu, nevis atpakaļ uz spēles lapu - cēlonis: Helmet noklusētais `Referrer-Policy: no-referrer` liedza pārlūkam sūtīt `Referer` header, uz ko paļāvās kods. Tagad izmanto `?returnTo=` URL parametru (`res.locals.currentUrl` + hidden form lauks, lai izturētu arī vairākus neveiksmīgus login mēģinājumus)
- [x] Login forma: pievienoti `autocomplete="username"`/`"current-password"` atribūti (varēja izraisīt neskaidru pārlūka autofill/autocomplete uzvedību)
- [x] Migrācijas skripts uzlabots ar pirmā-vārda fallback sasaisti (ja konta displayName tagad satur uzvārdu, piem. "Toms Brokāns", tas joprojām sasaistās ar veco "Toms (11+ gadi)" vērtējumu) - ambigū gadījumi (vairāki konti ar to pašu pirmo vārdu) netiek automātiski sasaistīti
- [x] Migrācija palaista reāli (2026-09-10): 19/23 vērtējumi sasaistīti (Santa, Toms, Imants). Atlikusi Paula - vēl nav konta, palaid `node scripts/migrateRatingsToUsers.js` vēlreiz pēc konta izveides
- [ ] Precizēt, kas vēl ietilpst "max iespējās" - pārējais lielā mērā pārklājas ar 4. punktu (spēļu pievienošana admin panelī)

### 2. Reāli lietotāju konti ģimenes locekļiem - DONE (2026-09-09)
- [x] Katrs ģimenes loceklis dabū savu kontu (username+parole via `createUser.js --name="..."`), ielogojas pats
- [x] Vērtējums tiek piesaistīts ielogotajam kontam (`rating.userId`), nevis brīvi izvēlētam vārdam - `ratingUsers`/`config/users.js` vairs netiek lietots kodā, atstāts kā atsauce migrācijai
- [x] Viens vērtējums per lietotājs per spēle (serverī pārbaudīts, `routes/ratings.js`), lietotājs var rediģēt savu esošo vērtējumu
- [x] Admin var labot/dzēst jebkuru vērtējumu neatkarīgi no autora (edit: admin vai autors; delete: tikai admin)
- [x] Migrācijas skripts `scripts/migrateRatingsToUsers.js` - sasaista vecos vērtējumus (tikai `name` string) ar jauniem kontiem pēc displayName/username sakritības (`--dry-run` pieejams priekšskatam)
- [ ] **Nākamais solis tev**: izveido reālus kontus katram ģimenes loceklim caur `/admin/users` ar vienkāršu attēloto vārdu **bez** vecuma piedēkļa (piem. "Imants", nevis "Imants (35+ gadi)" - vecums tagad rēķinās automātiski no dzimšanas datuma, ko katrs pats iestata profilā, tāpēc vecs piedēklis dublētos ekrānā). Migrācijas skripts salīdzina vārdus, ignorējot veco " (XX gadi)"/" (XX+ gadi)" piedēkli, tāpēc "Imants" sasaistīsies ar veco "Imants (35+ gadi)" ierakstu. Palaid `node scripts/migrateRatingsToUsers.js --dry-run`, pārbaudi rezultātu, tad bez `--dry-run`
- [ ] Lēmums vēl neapstiprināts: vai admin izveido kontus (kā tagad), vai ir arī pašu-reģistrācija ģimenes lokam - pagaidām palicis kā admin-only (`createUser.js`), atbilst esošajai UI/route struktūrai

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

### 8. "Manas vērtētās spēles" - pārskatāms saraksts (2026-09-10)
Ideja: lapa/sadaļa, kur lietotājs var redzēt VISAS spēles, kurām viņš ir devis vērtējumu, vienuviet, ļoti labi pārskatāmā veidā (nevis jāmeklē pa katru spēli atsevišķi).
- [ ] Jauna route, piem. `/profile/ratings` vai poga profila lapā "Manas vērtētās spēles"
- [ ] Query: `Game.find({"ratings.userId": lietotāja ID})`, ar katras spēles nosaukumu/attēlu + paša doto vērtējumu/komentāru tajā pašā rindā
- [ ] Kārtošana: pēc vērtējuma (augstākais/zemākais), pēc nosaukuma, vai pēc pievienošanas datuma (ja rating dabū savu `createdAt` lauku, kura šobrīd nav - jāpievieno)
- [ ] Dizains: kartīšu/saraksta skats līdzīgs sākumlapai, bet ar uzsvaru uz paša vērtējumu (redzams uzreiz, nevis jāatver katra spēle), varbūt arī ātra saite "labot vērtējumu" tieši no šī saraksta
- [ ] Var paplašināt vēlāk ar filtriem (piem. "spēles, ko vēl neesmu vērtējis")

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
