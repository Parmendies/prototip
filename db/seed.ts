import { db } from './index';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 DentaPanel veritabanı tohumlama (seed) başlatılıyor...');

  const passwordHash = await bcrypt.hash('123456', 10);
  const pinHash = await bcrypt.hash('1234', 10);

  // 1. Staff Users
  console.log('1. Personel kullanıcıları oluşturuluyor...');
  const [adminStaff] = await db
    .insert(schema.staffUsers)
    .values({
      fullName: 'Selin Aktaş (Sekreter / Banko)',
      email: 'sekreter@dentapanel.com',
      phone: '+905550001122',
      passwordHash,
      role: 'secretary',
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [doc1Staff] = await db
    .insert(schema.staffUsers)
    .values({
      fullName: 'Zeynep Kaya',
      email: 'zeynep@dentapanel.com',
      phone: '+905550003344',
      passwordHash,
      role: 'doctor',
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [doc2Staff] = await db
    .insert(schema.staffUsers)
    .values({
      fullName: 'Mehmet Yılmaz',
      email: 'mehmet@dentapanel.com',
      phone: '+905550005566',
      passwordHash,
      role: 'doctor',
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [doc3Staff] = await db
    .insert(schema.staffUsers)
    .values({
      fullName: 'Elif Demir',
      email: 'elif@dentapanel.com',
      phone: '+905550007788',
      passwordHash,
      role: 'doctor',
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  // 2. Doctor Profiles
  console.log('2. Hekim profilleri ve muayene ücretleri tanımlanıyor...');
  if (doc1Staff) {
    await db
      .insert(schema.doctorProfiles)
      .values({
        staffUserId: doc1Staff.id,
        title: 'Dt.',
        branch: 'Ortodonti & Genel Diş Tabibi',
        initialExamFee: '800.00',
        defaultSlotMinutes: 30,
        workingSchedule: {
          days: [1, 2, 3, 4, 5, 6],
          startHour: '09:00',
          endHour: '18:00',
          breakStart: '13:00',
          breakEnd: '14:00',
        },
      })
      .onConflictDoNothing();
  }

  if (doc2Staff) {
    await db
      .insert(schema.doctorProfiles)
      .values({
        staffUserId: doc2Staff.id,
        title: 'Uzm. Dt.',
        branch: 'Ağız, Diş ve Çene Cerrahisi',
        initialExamFee: '1200.00',
        defaultSlotMinutes: 45,
        workingSchedule: {
          days: [1, 2, 3, 4, 5],
          startHour: '10:00',
          endHour: '17:00',
          breakStart: '13:00',
          breakEnd: '14:00',
        },
      })
      .onConflictDoNothing();
  }

  if (doc3Staff) {
    await db
      .insert(schema.doctorProfiles)
      .values({
        staffUserId: doc3Staff.id,
        title: 'Dt.',
        branch: 'Endodonti (Kanal Tedavisi) & Pedodonti',
        initialExamFee: '900.00',
        defaultSlotMinutes: 30,
        workingSchedule: {
          days: [1, 2, 3, 4, 5, 6],
          startHour: '09:30',
          endHour: '18:30',
          breakStart: '13:00',
          breakEnd: '14:00',
        },
      })
      .onConflictDoNothing();
  }

  // 3. Procedure Templates (Hazır İşlem Kataloğu)
  console.log('3. Hazır diş işlem ve taban fiyat kataloğu ekleniyor...');
  const procedures = [
    { name: 'Kompozit Dolgu (Ön Diş Estetik)', category: 'Dolgu', defaultPrice: '1500.00', defaultDurationMin: 30, sortOrder: 1 },
    { name: 'Kompozit Dolgu (Arka Diş)', category: 'Dolgu', defaultPrice: '1200.00', defaultDurationMin: 30, sortOrder: 2 },
    { name: 'Kanal Tedavisi (Tek Kök)', category: 'Endodonti', defaultPrice: '2500.00', defaultDurationMin: 45, sortOrder: 3 },
    { name: 'Kanal Tedavisi (Çok Kök / Azı)', category: 'Endodonti', defaultPrice: '3500.00', defaultDurationMin: 60, sortOrder: 4 },
    { name: 'Diş Taşı Temizliği (Detertraj & Polisaj)', category: 'Periodontoloji', defaultPrice: '1000.00', defaultDurationMin: 30, sortOrder: 5 },
    { name: 'Diş Çekimi (Basit)', category: 'Cerrahi', defaultPrice: '900.00', defaultDurationMin: 20, sortOrder: 6 },
    { name: 'Gömülü 20 Yaş Diş Çekimi', category: 'Cerrahi', defaultPrice: '2800.00', defaultDurationMin: 45, sortOrder: 7 },
    { name: 'Zirkonyum Porselen Kaplama (Üye Başı)', category: 'Protez', defaultPrice: '4500.00', defaultDurationMin: 45, sortOrder: 8 },
    { name: 'Metal Destekli Porselen Kron', category: 'Protez', defaultPrice: '3000.00', defaultDurationMin: 45, sortOrder: 9 },
    { name: 'İmplant Cerrahi Aşama (Yerli)', category: 'İmplantoloji', defaultPrice: '12000.00', defaultDurationMin: 60, sortOrder: 10 },
    { name: 'İmplant Cerrahi Aşama (İthal - Premium)', category: 'İmplantoloji', defaultPrice: '19000.00', defaultDurationMin: 60, sortOrder: 11 },
    { name: 'Gece Plağı (Bruksizm / Çene Sıkma)', category: 'Genel', defaultPrice: '2200.00', defaultDurationMin: 30, sortOrder: 12 },
    { name: 'Ofis Tipi Lazer Diş Beyazlatma', category: 'Estetik', defaultPrice: '5500.00', defaultDurationMin: 60, sortOrder: 13 },
  ];

  for (const p of procedures) {
    await db.insert(schema.procedureTemplates).values(p).onConflictDoNothing();
  }

  // 4. Sample Patients
  console.log('4. Örnek hastalar tanımlanıyor...');
  const [patient1] = await db
    .insert(schema.patients)
    .values({
      phone: '+905551112233',
      pinHash,
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      tcIdentityNo: '12345678901',
      birthDate: '1989-05-14',
      medicalAlertNote: 'Penisilin alerjisi var.',
    })
    .onConflictDoNothing()
    .returning();

  const [patient2] = await db
    .insert(schema.patients)
    .values({
      phone: '+905554445566',
      pinHash,
      firstName: 'Ayşe',
      lastName: 'Çelik',
      tcIdentityNo: '98765432109',
      birthDate: '1995-10-22',
    })
    .onConflictDoNothing()
    .returning();

  // 5. Today's Sample Appointments
  console.log('5. Günün örnek randevuları ekleniyor...');
  const todayStr = new Date().toISOString().split('T')[0];
  const docProfiles = await db.select().from(schema.doctorProfiles);

  if (docProfiles.length > 0 && patient1) {
    // Randevu 1: QR Okutmuş ve Bankoda Ödeme Bekleyen Hasta
    await db
      .insert(schema.appointments)
      .values({
        patientId: patient1.id,
        doctorId: docProfiles[0].id,
        appointmentDate: todayStr,
        startTime: '14:00:00',
        endTime: '14:30:00',
        durationMin: 30,
        visitType: 'initial_exam',
        status: 'checked_in_unpaid', // Danışmada QR okuttu, kasa onayı bekliyor
        checkInMethod: 'qr',
        checkedInAt: new Date(),
        complaintText: 'Sol alt arka dişimde soğuk sızlaması ve çiğneme ağrısı var.',
        createdBy: 'patient',
      })
      .onConflictDoNothing();
  }

  if (docProfiles.length > 0 && patient2) {
    // Randevu 2: Ön Talep Aşamasında (Sekreter Araması Bekliyor)
    await db
      .insert(schema.appointments)
      .values({
        patientId: patient2.id,
        doctorId: docProfiles[0].id,
        appointmentDate: todayStr,
        startTime: '15:30:00',
        endTime: '16:00:00',
        durationMin: 30,
        visitType: 'initial_exam',
        status: 'pending_approval',
        complaintText: 'Ön dişimde hafif renk değişimi ve estetik dolgu kontrolü.',
        createdBy: 'patient',
      })
      .onConflictDoNothing();
  }

  console.log('✅ Tohumlama başarıyla tamamlandı!');
  console.log('--- TEST GİRİŞ BİLGİLERİ ---');
  console.log('Sekreter: sekreter@dentapanel.com / Şifre: 123456');
  console.log('Hekim 1 : zeynep@dentapanel.com   / Şifre: 123456');
  console.log('Hekim 2 : mehmet@dentapanel.com   / Şifre: 123456');
  console.log('Hasta 1 : +905551112233           / PIN: 1234');
  console.log('Hasta 2 : +905554445566           / PIN: 1234');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Tohumlama hatası:', err);
  process.exit(1);
});

