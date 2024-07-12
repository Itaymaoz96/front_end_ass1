const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const requestLogger = (request, response, next) => {
  const logEntry = `${new Date().toISOString()} - Method: ${
    request.method
  }, Path: ${request.path}, Body: ${JSON.stringify(request.body)}\n`;

  fs.appendFile("log.txt", logEntry, (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });

  next();
};

app.use(requestLogger);

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

const noteSchema = new mongoose.Schema({
  id: Number,
  title: String,
  author: {
    name: String,
    email: String,
  },
  content: String,
});

noteSchema.set("toJSON", {
  transform: (document, retObj) => {
    retObj._id = retObj._id.toString();
    delete retObj._id;
    delete retObj.__v;
  },
});

const Note = mongoose.model("Note", noteSchema);

const newNote = new Note({
  id: 14,
  title: "big",
  author: {
    name: "itayush",
    email: "bla@bla.com",
  },
  content: "something bla",
});

app.get("/notes", (req, res) => {
  const page = parseInt(req.query._page) || 1;
  const limit = parseInt(req.query._per_page) || 10;
  const skip = (page - 1) * limit;

  Note.find({})
    .skip(skip)
    .limit(limit)
    .then((notes) => {
      res.status(200).json(notes);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.get("/notes/total", (req, res) => {
  Note.countDocuments({})
    .then((count) => {
      res.status(200).json({ total: count });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/notes", (request, response) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const note = new Note({
    id: body.id,
    title: body.title,
    author: body.author,
    content: body.content,
  });

  note
    .save()
    .then((saved_Note) => {
      response.status(201).json(saved_Note);
    })
    .catch((error) => {
      response.status(500).json({ error: error.message });
    });
});

app.get("/notes/:pos", async (request, response, next) => {
  const pos = parseInt(request.params.pos);

  if (isNaN(pos) || pos < 1) {
    return response.status(404).json({ error: "Invalid position" });
  }

  try {
    const notes = await Note.find({}).sort({ _id: 1 });

    if (pos > notes.length) {
      return response.status(404).json({ error: "No such note exists" });
    }

    const note_to_ret = notes[pos - 1];

    response.status(200).json(note_to_ret);
  } catch (error) {
    next(error);
  }
});

app.delete("/notes/:pos", async (request, response, next) => {
  const pos = parseInt(request.params.pos);

  if (isNaN(pos) || pos < 1) {
    return response.status(404).json({ error: "Invalid position" });
  }

  try {
    const notes = await Note.find({}).sort({ _id: 1 });

    if (pos > notes.length) {
      return response.status(404).json({ error: "No such note exists" });
    }

    const note_to_delete = notes[pos - 1];
    await Note.findByIdAndDelete(note_to_delete._id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.put("/notes/:pos", async (request, response, next) => {
  const pos = parseInt(request.params.pos);
  const body = request.body;

  if (isNaN(pos) || pos < 1) {
    return response.status(404).json({ error: "Invalid position" });
  }

  const updated_note = {
    content: body.content,
  };

  try {
    const notes = await Note.find({}).sort({ _id: 1 });

    if (pos > notes.length) {
      return response.status(404).json({ error: "No such note exists" });
    }

    const note_to_update = notes[pos - 1];

    const result = await Note.findByIdAndUpdate(
      note_to_update._id,
      { $set: updated_note },
      { new: true }
    );

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
