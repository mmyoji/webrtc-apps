import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from "amazon-chime-sdk-js";
import { useState } from "preact/hooks";

import type { SubmitEventHandler } from "preact";
import "./app.css";

export function App() {
  const [meetingId, setMeetingId] = useState("");
  const [externalMeetingId, setExternalMeetingId] = useState("");
  const [userId, setUserId] = useState("");
  const [session, setSession] = useState<DefaultMeetingSession | null>(null);

  const logger = new ConsoleLogger("ChimeMeetingLogs", LogLevel.INFO);
  const deviceController = new DefaultDeviceController(logger);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId: !!meetingId ? meetingId : undefined,
          clientRequestToken: crypto.randomUUID(),
          externalMeetingId,
          userId,
        }),
      });
      const { meeting, attendee } = await res.json();
      const config = new MeetingSessionConfiguration(meeting, attendee);
      const meetingSession = new DefaultMeetingSession(
        config,
        logger,
        deviceController
      );
      setSession(meetingSession);
      console.log("Meeting session initialized:", meetingSession);
    } catch (err) {
      console.error(`Failed to initialize meeting session:`);
      console.error(err);
    }
  };

  return (
    <>
      <h1>Amazon Chime SDK App</h1>
      <div class="card">
        <form onSubmit={handleSubmit}>
          <div>
            <label for="meetingId">Meeting ID</label>
            <input
              type="text"
              id="meetingId"
              value={meetingId}
              onInput={(e) => setMeetingId(e.currentTarget.value)}
            />
          </div>

          <div>
            <label for="externalMeetingId">Room Name</label>
            <input
              type="text"
              id="externalMeetingId"
              value={externalMeetingId}
              onInput={(e) => setExternalMeetingId(e.currentTarget.value)}
            />
          </div>

          <div>
            <label for="userId">Your Name</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onInput={(e) => setUserId(e.currentTarget.value)}
            />
          </div>

          <button type="submit">Join Meeting</button>
        </form>
      </div>

      {session && <p>Meeting session is ready to use!</p>}
    </>
  );
}
