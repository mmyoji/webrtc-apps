import { ChimeSDKMeetings } from "@aws-sdk/client-chime-sdk-meetings";
import cors from "cors";
import express from "express";

const app = express();

app.use(express.json());
app.use(cors());

const REGION = "ap-northeast-1";

app.post("/meetings", async (req, res) => {
  const chimeSDKMeetings = new ChimeSDKMeetings({
    region: REGION,
    // ...(process.env.ENDPOINT && { endpoint: process.env.ENDPOINT }),
  });

  const primaryMeeting =
    typeof req.body.meetingId === "string"
      ? await chimeSDKMeetings.getMeeting({
          MeetingId: req.body.meetingId,
        })
      : undefined;

  const meeting = await chimeSDKMeetings.createMeeting({
    ClientRequestToken: req.body.clientRequestToken,

    // Specify the media region (where the meeting is hosted).
    MediaRegion: REGION,

    // Any meeting ID you wish to associate with the meeting.
    ExternalMeetingId: req.body.externalMeetingId,

    // Setup meeting features, such as audio / video settings, max attendees, etc.
    MeetingFeatures: {},

    ...(primaryMeeting?.Meeting?.MeetingId != null
      ? { PrimaryMeetingId: primaryMeeting.Meeting?.MeetingId }
      : {}),
  });

  const attendee = await chimeSDKMeetings.createAttendee({
    MeetingId: meeting.Meeting?.MeetingId,

    // Any user ID you wish to associate with the attendee.
    ExternalUserId: req.body.userId,
  });

  // The client uses these values for `new MeetingSessionConfiguration(meeting, attendee)`
  res.json({
    meeting,
    attendee,
  });
  /**
   * Example response:
   *
   * {
   *   "meeting": {
   *     "Meeting": {
   *       "MeetingId": "${meetingId}",
   *       "ExternalMeetingId": "test",
   *       "MediaRegion": "ap-northeast-1",
   *       "MediaPlacement": {
   *         "AudioHostUrl": "xxxxxxxxxxxxx.k.m3.an1.app.chime.aws:3478",
   *         "AudioFallbackUrl": "wss://wss.k.m3.an1.app.chime.aws:443/calls/${meetingId}",",
   *         "SignalingUrl": "wss://signal.m3.an1.app.chime.aws/control/${meetingId}",",
   *         "TurnControlUrl": "https://4804.cell.ap-northeast-1.meetings.chime.aws/v2/turn_sessions",
   *         "ScreenDataUrl": "wss://bitpw.m3.an1.app.chime.aws:443/v2/screen/${meetingId}",",
   *         "ScreenViewingUrl": "wss://bitpw.m3.an1.app.chime.aws:443/ws/connect?passcode=null&viewer_uuid=null&X-BitHub-Call-Id=${meetingId}",",
   *         "ScreenSharingUrl": "wss://bitpw.m3.an1.app.chime.aws:443/v2/screen/${meetingId}",",
   *         "EventIngestionUrl": "https://data.svc.an1.ingest.chime.aws/v1/client-events"
   *       },
   *       "TenantIds": [],
   *       "MeetingArn": "arn:aws:chime:ap-northeast-1:xxxxxx:m* Connection #0 to host localhost left intacteeting/${meetingId}","
   *     },
   *     "$metadata": {
   *       "httpStatusCode": 200,
   *       "requestId": "3629ce88-0d2d-42da-882f-08fc736beae8",
   *       "attempts": 1,
   *       "totalRetryDelay": 0
   *     }
   *   },
   *   "attendee": {
   *     "Attendee": {
   *       "ExternalUserId": "mmyoji",
   *       "AttendeeId": "f1dc71bc-c43f-4ba4-08ae-fc57ce81aaea",
   *       "JoinToken": "ZjFkYzcxYmMtYzQzZi00YmE0LTA4YWUtZmM1N2NlODFhYWVhOmJlMGQzMmRmLTNlOTItNDMzZi1iNGY1LWI5NjJlOTFkYjBkYw",
   *       "Capabilities": {
   *         "Audio": "SendReceive",
   *         "Video": "SendReceive",
   *         "Content": "SendReceive"
   *       }
   *     },
   *     "$metadata": {
   *       "httpStatusCode": 200,
   *       "requestId": "658bf124-f9b5-49c7-b7e3-f0b5d56135d8",
   *       "attempts": 1,
   *       "totalRetryDelay": 0
   *     }
   *   }
   * }
   */
});

app.use((req, res) => {
  res.status(404).json({ message: `Not Found: ${req.method} ${req.path}` });
});

app.use((err, _req, res, next) => {
  if (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
    return;
  }

  next();
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
