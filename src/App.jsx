import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */
Amplify.configure(outputs);

const client = generateClient({
  authMode: "userPool",
});

export default function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const sub = client.models.Note.observeQuery().subscribe({
      next: (data) => setNotes([...data.items]),
    });

    return () => sub.unsubscribe();
  }, []);

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    await client.models.Note.create({
      title: form.get("title"),
      content: form.get("content"),
    });
    event.target.reset();
  }

  async function deleteNote({ id }) {
    await client.models.Note.delete({ id });
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          <Heading level={1}>Notes App</Heading>

          {/* Create Note Form */}
          <View as="form" margin="3rem 0" onSubmit={createNote}>
            <Flex direction="column" gap="1rem" padding="2rem">
              <TextField
                name="title"
                placeholder="Note Title"
                label="Note Title"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="content"
                placeholder="Note Content"
                label="Note Content"
                labelHidden
                variation="quiet"
                required
              />
              <Button type="submit" variation="primary">
                Create Note
              </Button>
            </Flex>
          </View>

          <Divider />

          {/* Notes List */}
          <Heading level={2}>My Notes</Heading>
          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {notes.map((note) => (
              <Flex
                key={note.id || note.title}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="1rem"
                border="1px solid #ccc"
                padding="1.5rem"
                borderRadius="8px"
                className="box"
              >
                <Heading level={3}>{note.title}</Heading>
                <Text>{note.content}</Text>
                <Button
                  variation="destructive"
                  onClick={() => deleteNote(note)}
                >
                  Delete Note
                </Button>
              </Flex>
            ))}
          </Grid>

          <Button onClick={signOut}>Sign Out</Button>
        </Flex>
      )}
    </Authenticator>
  );
}
