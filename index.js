const express = require("express")
const app = express()

const { Pool } = require("pg")
if (process.env.DATABASE_URL) {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl: {
			rejectUnauthorized: false
		}
	})
} else {
	const pool = new Pool({
		connectionString: "postgres://robotechnic@localhost:5432/pixelMailTracker",
		ssl: false
	})
}


const helmet = require("helmet")
app.use(helmet())

app.set("view engine","ejs")

app.use(express.static(__dirname+"/public"))

app.use(express.urlencoded({
	extended: true
}))

app.get("/",async (req,res)=>{
	let client
	try {
		client = await pool.connect()
		const result = await client.query("SELECT * FROM pixels")
		client.release()
		res.render("index.ejs", {result: result.rows, error: false})
	} catch (err) {
		console.error(err)
		res.render("index.ejs",{error: true})
	} 
})

app.post("/",async(req,res)=>{
	const userName = req.body.userName
	if (!userName) {
		res.redirect("/#name")
	}

	try {
		client = await pool.connect()
		const result = await client.query("INSERT INTO pixels (userName) VALUES ($1::text)", [userName])
		client.release()
		res.redirect("/")
	} catch (err) {
		console.error(err)
		res.redirect("/")
	}
})

const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
app.get("/pixel/:pixelId",async (req,res)=>{
	const pixelId = req.params.pixelId

	res.writeHead(200, {
		"Content-Type": "image/gif",
		"Content-Length": pixel.length
	})
	
	let client
	try {
		client = await pool.connect()
		const result = await client.query("UPDATE pixels SET seen=seen+1, lastSee=NOW()  WHERE id=$1::int",[pixelId])
		client.release()
	} catch (err) {
		console.error(err)
	}

	res.end(pixel)
})

app.listen(process.env.PORT,()=>{
	console.log("Server listen on",process.env.PORT)
})