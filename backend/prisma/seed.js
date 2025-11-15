import pkg from "@prisma/client";
import bcrypt from "bcryptjs";

const { PrismaClient, Role, BorrowStatus, CopyStatus } = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Seeding Library DB...");
  const hashedAdminPass = bcrypt.hashSync("admin123", 10);
  const staffPass = bcrypt.hashSync("123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@library.vn" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@library.vn",
      passwordHash: hashedAdminPass,
      role: Role.ADMIN,
      phone: "0000000000",
    },
  });

  const librarian = await prisma.user.upsert({
    where: { email: "lib@library.vn" },
    update: {},
    create: {
      name: "Thu thu",
      email: "lib@library.vn",
      passwordHash: staffPass,
      role: Role.LIBRARIAN,
      phone: "0900000001",
    },
  });

  await prisma.user.upsert({
    where: { email: "acc@library.vn" },
    update: {},
    create: {
      name: "Ke toan",
      email: "acc@library.vn",
      passwordHash: staffPass,
      role: Role.ACCOUNTANT,
      phone: "0900000002",
    },
  });

  console.log("✅ Staff created");

  const booksData = [
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      genre: "Lap trinh",
      publishedYear: 2008,
      language: "English",
      description: "A Handbook of Agile Software Craftsmanship",
      location: "A1-01",
      copies: 5,
    },
    {
      title: "Design Patterns",
      author: "GoF",
      genre: "Lap trinh",
      publishedYear: 1994,
      language: "English",
      description: "Elements of Reusable Object-Oriented Software",
      location: "A1-02",
      copies: 3,
    },
    {
      title: "Introduction to Algorithms",
      author: "CLRS",
      genre: "Thuat toan",
      publishedYear: 2009,
      language: "English",
      description: "CLRS classic",
      location: "A1-03",
      copies: 4,
    },
  ];

  const books = [];
  for (const b of booksData) {
    const bk = await prisma.book.upsert({
      where: {
        title_author_publishedYear: {
          title: b.title,
          author: b.author,
          publishedYear: b.publishedYear,
        },
      },
      update: {
        genre: b.genre,
        language: b.language,
        description: b.description,
        location: b.location,
      },
      create: {
        title: b.title,
        author: b.author,
        genre: b.genre,
        language: b.language,
        publishedYear: b.publishedYear,
        description: b.description ?? null,
        location: b.location,
      },
    });
    books.push(bk);
    const existingCount = await prisma.bookCopy.count({
      where: { bookId: bk.id },
    });
    const need = Math.max(0, b.copies - existingCount);
    for (let i = 0; i < need; i++) {
      await prisma.bookCopy.create({
        data: {
          bookId: bk.id,
          status: CopyStatus.AVAILABLE,
        },
      });
    }
  }

  console.log("✅ Books & copies created");

  const readersData = [
    {
      name: "Nguyen Van A",
      address: "Ha Noi",
      phone: "0912345678",
      email: "a@library.vn",
      password: "123456",
    },
    {
      name: "Tran Thi B",
      address: "Ha Noi",
      phone: "0987654321",
      email: "b@library.vn",
      password: "123456",
    },
    {
      name: "Le Van C",
      address: "Da Nang",
      phone: "0909090909",
      email: "c@library.vn",
      password: "123456",
    },
  ];

  const readers = [];
  for (const r of readersData) {
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {
        name: r.name,
        phone: r.phone,
      },
      create: {
        name: r.name,
        email: r.email,
        passwordHash: bcrypt.hashSync(r.password, 10),
        role: Role.READER,
        phone: r.phone,
      },
    });

    const profile = await prisma.readerProfile.upsert({
      where: { userId: user.id },
      update: { address: r.address },
      create: { userId: user.id, address: r.address },
    });

    readers.push({ user, profile });
  }

  console.log("✅ Readers created");
  const now = new Date();
  const daysFromNow = (d) => {
    const t = new Date(now);
    t.setDate(t.getDate() + d);
    return t;
  };

  async function pickAvailableCopyId(bookId) {
    const copy = await prisma.bookCopy.findFirst({
      where: { bookId, status: CopyStatus.AVAILABLE },
      orderBy: { id: "asc" },
    });
    return copy?.id ?? null;
  }

  const br1CopyId = await pickAvailableCopyId(books[0].id); 
  const br2CopyId = await pickAvailableCopyId(books[1].id); 
  const br3CopyId = await pickAvailableCopyId(books[2].id); 


  const borrowingsToCreate = [
    {
      copyId: br1CopyId,
      readerId: readers[0].profile.id,
      staffId: librarian?.id ?? null,
      borrowDate: daysFromNow(-2),
      dueDate: daysFromNow(12),
      returnDate: null,
      status: BorrowStatus.BORROWED,
      bookId: books[0].id, 
    },
    {
      copyId: br2CopyId,
      readerId: readers[1].profile.id,
      staffId: librarian?.id ?? null,
      borrowDate: daysFromNow(-20),
      dueDate: daysFromNow(-10),
      returnDate: daysFromNow(-11),
      status: BorrowStatus.RETURNED,
      bookId: books[1].id,
    },
    {
      copyId: br3CopyId,
      readerId: readers[2].profile.id,
      staffId: librarian?.id ?? null,
      borrowDate: daysFromNow(-15),
      dueDate: daysFromNow(-7),
      returnDate: daysFromNow(-5),
      status: BorrowStatus.RETURNED,
      bookId: books[2].id,
    },
  ].filter((x) => x.copyId); 

  const createdBorrowings = [];
  for (const br of borrowingsToCreate) {
    if (br.status === BorrowStatus.BORROWED) {
      await prisma.bookCopy.update({
        where: { id: br.copyId },
        data: { status: CopyStatus.BORROWED },
      });
    } else {
      await prisma.bookCopy.update({
        where: { id: br.copyId },
        data: { status: CopyStatus.AVAILABLE },
      });
    }

    const created = await prisma.borrowing.create({ data: br });
    createdBorrowings.push(created);
  }

  console.log("✅ Borrowings created");

  const late = createdBorrowings.find(
    (b) => b.returnDate && new Date(b.returnDate) > new Date(b.dueDate)
  );
  if (late) {
    const daysLate = Math.ceil(
      (new Date(late.returnDate) - new Date(late.dueDate)) / (1000 * 60 * 60 * 24)
    );
    const amount = String(daysLate * 5000); 
    await prisma.fine.create({
      data: {
        borrowingId: late.id,
        reason: `Tra tre ${daysLate} ngay`,
        amount,
        fineDate: new Date(),
        paidAt: null,
      },
    });
    console.log(`✅ Fine created for late return: ${daysLate} day(s)`);
  } else {
    console.log("ℹ️ No late return found for fine.");
  }

  console.log("🎉 Seeding done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
