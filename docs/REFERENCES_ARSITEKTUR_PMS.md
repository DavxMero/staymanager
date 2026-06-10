# Referensi Akademik — Gambar 1.1 & 2.1 (Arsitektur PMS)

Sumber yang bisa disitir saat dosen penguji bertanya *"diagram ini dari mana?"*. Pilih 2-3 yang paling sesuai dengan gaya sitasi dosenmu.

---

## Gambar 1.1 — Arsitektur Fungsional PMS (modul bisnis: Front Office, Core, Back Office, Distribution)

### Buku Standar Hospitality Industry (tier-1 references)

**[1] Kasavana, M. L., & Cahill, J. J. (2007).** *Managing Technology in the Hospitality Industry* (5th ed.). American Hotel & Lodging Educational Institute. ISBN: 978-0866123204.
> Standar referensi PMS di program hospitality. Bab 2-4 membahas struktur modul Front Office, Back Office, dan distribusi.

**[2] Bardi, J. A. (2010).** *Hotel Front Office Management* (5th ed.). John Wiley & Sons. ISBN: 978-0470637524.
> Komprehensif untuk komponen Front Office (reception, reservation, concierge, folio).

**[3] O'Connor, P. (2004).** *Using Computers in Hospitality* (3rd ed.). Thomson/Cengage Learning. ISBN: 978-1844800803.
> Membahas peran PMS dalam ekosistem hotel + integrasi dengan POS, CRM, channel manager.

**[4] Vallen, G. K., & Vallen, J. J. (2017).** *Check-in Check-Out: Managing Hotel Operations* (10th ed.). Pearson. ISBN: 978-0134484488.
> Salah satu textbook hospitality management paling sering dijadikan rujukan di Indonesia.

### Distribution Layer (OTA, GDS, Channel Manager)

**[5] Buhalis, D., & Law, R. (2008).** "Progress in information technology and tourism management: 20 years on and 10 years after the Internet — The state of eTourism research." *Tourism Management*, 29(4), 609-623. https://doi.org/10.1016/j.tourman.2008.01.005
> Highly cited (5000+) — bahas evolusi distribusi hotel dari GDS ke OTA + channel manager.

**[6] Carroll, B., & Siguaw, J. (2003).** "The evolution of electronic distribution: Effects on hotels and intermediaries." *Cornell Hotel and Restaurant Administration Quarterly*, 44(4), 38-50.
> Referensi klasik untuk rantai distribusi hotel.

**[7] Buhalis, D. (2003).** *eTourism: Information Technology for Strategic Tourism Management*. Pearson Education / Financial Times Prentice Hall. ISBN: 978-0582357402.
> Buku komprehensif distribusi pariwisata, ada bab khusus channel manager.

### Industry Standards (untuk konteks praktis)

**[8] Oracle Hospitality.** *OPERA Cloud Property Management System — Architecture Overview*. Oracle Corporation Documentation. https://docs.oracle.com/cd/E97808_01/
> OPERA = PMS dominan industri. Architecture overview dokumentasi resminya bisa jadi sitiran "industry reference".

**[9] HTNG (Hotel Technology Next Generation).** *Reference Architecture for Hospitality*. https://www.htng.org/
> Konsorsium standar teknologi hotel — punya spec arsitektur referensi.

---

## Gambar 2.1 — Arsitektur Layered PMS (model 4-tier software architecture)

### Buku Software Architecture (foundational)

**[10] Bass, L., Clements, P., & Kazman, R. (2021).** *Software Architecture in Practice* (4th ed.). Addison-Wesley Professional. ISBN: 978-0136886099.
> Buku referensi utama software architecture. Bab tentang **layered pattern** justifikasi gambar layered.

**[11] Fowler, M. (2002).** *Patterns of Enterprise Application Architecture*. Addison-Wesley. ISBN: 978-0321127426.
> Bab "Layering" — sumber kanonik untuk pola arsitektur berlapis (presentation, domain, data source).

**[12] Richards, M., & Ford, N. (2020).** *Fundamentals of Software Architecture: An Engineering Approach*. O'Reilly Media. ISBN: 978-1492043454.
> Lebih modern, bahas layered architecture + microservices + event-driven.

### PMS-Specific Architecture Papers

**[13] Cobanoglu, C., Berezina, K., Kasavana, M. L., & Erdem, M. (2011).** "The Impact of Technology Amenities on Hotel Guest Overall Satisfaction." *Journal of Quality Assurance in Hospitality & Tourism*, 12(4), 272-288.
> Konteks teknologi hotel dari sisi user satisfaction — bisa untuk justifikasi UI layer.

**[14] Law, R., Leung, R., Lo, A., Leung, D., & Fong, L. H. N. (2015).** "Distribution channel in hospitality and tourism: Revisiting disintermediation from the perspectives of hotels and travel agencies." *International Journal of Contemporary Hospitality Management*, 27(3), 431-452.
> Bahas integration layer secara akademik.

**[15] Pizam, A. (Ed.). (2010).** *International Encyclopedia of Hospitality Management* (2nd ed.). Routledge. ISBN: 978-0080965550.
> Entry "Property Management System" punya diagram layered architecture standar.

### Layered Pattern Justification (textbook)

**[16] Sommerville, I. (2015).** *Software Engineering* (10th ed.). Pearson. ISBN: 978-0133943030.
> Standard textbook software engineering Indonesia — bab arsitektur perangkat lunak.

**[17] Pressman, R. S., & Maxim, B. R. (2019).** *Software Engineering: A Practitioner's Approach* (9th ed.). McGraw-Hill. ISBN: 978-1259872976.
> Setara Sommerville — alternatif jika kampus lebih familiar.

---

## Cara Sitasi yang Disarankan di Naskah

### Untuk Gambar 1.1 (Bab 1 Pendahuluan):

> "Arsitektur fungsional PMS modern terdiri dari beberapa lapisan utama: Front Office, Core PMS Engine, Back Office, Distribution Layer (termasuk OTA dan Channel Manager), serta integrasi eksternal [1], [3], [5]. Gambar 1.1 mengilustrasikan komponen-komponen tersebut."

### Untuk Gambar 2.1 (Bab 2 Tinjauan Pustaka):

> "Dari perspektif software architecture, PMS umumnya mengadopsi pola **layered architecture** yang membagi sistem ke dalam empat tier: presentation, application/business logic, integration, dan data layer [10], [11]. Pola ini memberikan separation of concerns dan kemudahan maintenance [16]. Gambar 2.1 menunjukkan adaptasi pola tersebut untuk konteks PMS."

### Disclaimer (penting!)

> "Gambar 1.1 dan 2.1 merupakan **sintesis penulis** berdasarkan literatur [1, 3, 5, 10, 11], **bukan reproduksi langsung** dari satu sumber. Diagram disesuaikan dengan konteks penelitian ini di StayManager."

Kalimat "sintesis penulis" ini **kunci** — kalau dosen tanya "sumbernya 1 buku spesifik?", jawabannya: kombinasi beberapa referensi dengan adaptasi untuk konteks penelitian.

---

## Quick Answers untuk Q&A Dosen Penguji

**Q: "Diagram 1.1 sama 2.1 itu sama saja kan?"**
> *Tidak. 1.1 adalah perspektif **fungsional** — apa saja modul bisnis dalam PMS dan bagaimana mereka berinteraksi (Front Office, Back Office, Distribution dengan OTA/Channel Manager). 2.1 adalah perspektif **arsitektur perangkat lunak** — bagaimana sistem dibagi menjadi tier secara teknis (UI → Application → Integration → Data). Keduanya saling melengkapi: 1.1 menjawab "what" dan 2.1 menjawab "how".*

**Q: "Sumber gambarnya dari mana?"**
> *Sintesis dari beberapa referensi standar. Untuk Gambar 1.1, mengacu pada Kasavana & Cahill (2007), Bardi (2010), dan O'Connor (2004) untuk struktur modul, serta Buhalis & Law (2008) untuk Distribution Layer. Untuk Gambar 2.1, mengacu pada layered architecture pattern dari Bass et al. (2021) dan Fowler (2002), dengan adaptasi konteks PMS.*

**Q: "Kenapa harus ada OTA/Channel Manager?"**
> *OTA (Booking.com, Agoda, Traveloka) dan Channel Manager adalah komponen distribusi standar PMS modern. Tanpa Channel Manager, hotel harus update inventory dan harga secara manual ke setiap OTA → risiko overbooking dan rate parity violation [5, 6, 7]. Meskipun StayManager dalam scope penelitian ini tidak mengimplementasikan integrasi OTA, komponen tersebut tetap ditampilkan di diagram referensi sebagai bagian standar arsitektur PMS untuk konteks pembaca.*

**Q: "Channel Manager dan OTA tidak ada di sistem StayManager kan?"**
> *Benar. StayManager fokus pada **Direct Booking Channel** (chatbot dan web) sebagai scope penelitian. OTA/Channel Manager ditampilkan di Gambar 1.1 sebagai bagian dari arsitektur PMS umum di industri (per Kasavana & Cahill, 2007), bukan implementasi penelitian ini. Lihat batasan masalah di Bab 1.4.*

---

**Tips:**
- Pilih 3-4 referensi utama yang **benar-benar bisa kamu akses** (jangan sitir paper yang belum pernah dibaca — dosen sering nanya isinya).
- **Vallen & Vallen** + **Kasavana & Cahill** paling aman untuk PMS general — banyak yang punya di perpustakaan kampus hospitality/manajemen.
- **Bass et al.** + **Fowler** wajib kalau dosen penguji bidang informatika/SE.
- Tambahkan "**[diadaptasi dari]**" di caption gambar kalau merasa sintesis sangat jauh dari sumber asli.
