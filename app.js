const express = require("express");
const app = express();
const cors = require("cors");
var multer = require("multer");
var upload = multer();
const port = process.env.PORT || 5000;
const puppeteer = require("puppeteer");

const wa = require("@open-wa/wa-automate");

puppeteer.launch({
    args: ["--no-sandbox"],
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// for parsing multipart/form-data
app.use(upload.array());
app.use(express.static("public"));

// app.get('/', (req, res) => {
//     res.send('Welcome to My Bot!');
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

const zeroFill = (n) => {
    return ("0" + n).slice(-2);
};

// const monthNames = [
//     "Januari",
//     "Febuari",
//     "Maret",
//     "April",
//     "Mei",
//     "Juni",
//     "Juli",
//     "Agustus",
//     "September",
//     "Oktober",
//     "November",
//     "Desember",
// ];

const formatRupiah = (angka, prefix) => {
    var number_string = angka.replace(/[^,\d]/g, "").toString(),
        split = number_string.split(","),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
        separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }

    rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
    return prefix == undefined ? rupiah : rupiah ? "Rp " + rupiah : "";
};

var date;
var time;
setInterval(async () => {
    var today = new Date();
    date =
        zeroFill(today.getDate()) +
        "-" +
        // monthNames[today.getMonth()] +
        zeroFill(today.getMonth() + 1) +
        "-" +
        today.getFullYear();
    time =
        zeroFill(today.getHours()) +
        ":" +
        zeroFill(today.getMinutes()) +
        ":" +
        zeroFill(today.getSeconds());
    // dateTime = date + " " + time;
}, 1000);

async function start(client) {
    app.use(client.middleware(true));
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
    app.get("/", (req, res) => {
        res.send("Welcome to My Bot!");
    });
    app.post("/login", async (req, res) => {
        const { username } = req.body;
        await client.sendText(
            "6283893703656@c.us",
            `✅ *LOGIN NOTIFICATION*\n• _Username_: *${username}*\n• _Date_: *${date}*\n• _Time_: *${time}*`
        );
        res.status(200).json({ message: "Login Success" });
    });
    app.post("/logout", async (req, res) => {
        const { username } = req.body;
        await client.sendText(
            "6283893703656@c.us",
            `❌ *LOGOUT NOTIFICATION*\n• _Username_: *${username}*\n• _Date_: *${date}*\n• _Time_: *${time}*`
        );
        res.status(200).json({ message: "Logout Success" });
    });
    app.post("/deposit", async (req, res) => {
        console.log("Deposit");
        const {
            nama,
            kode_deposit,
            jumlah_transfer,
            tujuan,
            get_saldo,
            saldo,
        } = req.body;
        const { status } = req.query;
        // await client.sendText(
        //     "6283893703656@c.us",
        //     `💰 *DEPOSIT NOTIFICATION*\n• _Username_: *${username}*\n• _Jumlah_: *${jumlah}*\n• _Payment_: *${payment}*\n• _Status_: *${status}*\n• _Date_: *${date}*\n• _Time_: *${time}*`
        // );
        if (status == "created") {
            console.log("Deposit Created");
            await client.sendText(
                "6283893703656@c.us",
                `Hai *${nama}*,\nSilahkan lakukan pembayaran untuk Invoice *#${kode_deposit}* sebesar: \n💵*Rp ${formatRupiah(
                    jumlah_transfer
                )}*\nSilahkan Transfer ke: \n*💳BCA ${tujuan}*\n\n_Permintaan isi saldo Anda akan otomatis dibatalkan atau dierrorkan oleh sistem jika dalam waktu 6 jam sistem kami belum mendeteksi adanya Pembayaran atau Transfer masuk dari Anda._`
            );
            res.status(200).json({ message: "Deposit Created" });
        } else if (status == "success") {
            console.log("Deposit Success");
            await client.sendText(
                "6283893703656@c.us",
                `Hai *${nama}*,\nPembayaran invoice *#${kode_deposit}* berhasil.\nJumlah pembayaran yang di transfer: \n*${formatRupiah(
                    jumlah_transfer,
                    "Rp "
                )}*\nSaldo yang di terima: \n*${formatRupiah(
                    get_saldo,
                    "Rp "
                )}*\nTotal saldo anda: *${formatRupiah(
                    saldo,
                    "Rp "
                )}*\n\n*| Bos Panel Sosmed |*\n${date} _${time}_ WIB`
            );
            res.status(200).json({ message: "Deposit Success" });
        }
    });
    app.post("/order", async (req, res) => {
        console.log("Order Created");
        const { nama, order_id, layanan, target, jumlah, total } = req.body;
        await client.sendText(
            "6283893703656@c.us",
            `Hai *${nama}*,\nkamu berhasil membuat pesanan dan akan segera diproses.\nberikut data pesanan kamu :\n- *ID* :  ${order_id}\n- *Layanan* :  ${layanan}\n- *Target* :  ${target}\n- *Jumlah Pesan* :  ${jumlah}\n- *Total Harga* :  ${formatRupiah(
                total,
                "Rp "
            )}\n\n*| Bos Panel Sosmed |*\n${date} _${time}_ WIB`
        );
        res.status(200).json({ message: "Order Success" });
    });
    client.onMessage(async (message) => {
        console.log(message);
    });
}

wa.create({
    sessionId: "COVID_HELPER",
    // multiDevice: true, //required to enable multiDevice support
    // authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    // blockCrashLogs: true,
    // disableSpins: true,
    // headless: true,
    // hostNotificationLang: 'PT_BR',
    // logConsole: false,
    // popup: true,
    // qrTimeout: 0 //0 means it will wait forever for you to scan the qr code
})
    .then(async (client) => await start(client))
    .catch((e) => {
        console.log("Error", e.message);
        // process.exit();
    });
