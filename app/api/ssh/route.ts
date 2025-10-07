// app/api/upload/route.ts
import { NextResponse } from "next/server";
import SFTPClient from "ssh2-sftp-client";

function getPrivateKey(): string {
  const b64 = process.env.SSH_PRIVATE_KEY_BASE64;

  if (!b64) throw new Error("Missing SSH_PRIVATE_KEY_BASE64");

  return Buffer.from(b64, "base64")
    .toString("utf8")
    .trim()
    .replace(/\r\n/g, "\n");
}

//Test ssh connection
export async function GET() {
  console.log("GET received (testing SFTP connection)");

  const sftp = new SFTPClient();

  try {
    await sftp.connect({
      host: "127.0.0.1",
      port: 2222,
      username: "sftpuser",
      privateKey: getPrivateKey(),
      readyTimeout: 10_000,
    });

    console.log("SFTP connected");

    const list = await sftp.list(".");
    console.log(
      "[/api/ssh] remote directory listing:",
      list.map((f) => f.name)
    );

    await sftp.end();

    return NextResponse.json({
      ok: true,
      message: "SFTP connection successful",
      files: list.map((f) => f.name),
    });
  } catch (err: any) {
    console.error("Connection failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: String(err),
      },
      { status: 500 }
    );
  } finally {
    try {
      await sftp.end();
    } catch {}
    console.log("[/api/ssh] Connection closed");
  }
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());


  const timestamp = Date.now();
  const originalName = file.name;
  const safeName = originalName.replace(/[^\w.\-]+/g, "_");
  const remoteName = `${timestamp}_${safeName}`;

  console.log("this is remoteName: " + remoteName);

  const sftp = new SFTPClient();
  try {
    await sftp.connect({
      host: "127.0.0.1",
      port: 2222,
      username: "sftpuser",
      privateKey: getPrivateKey(),
      readyTimeout: 10_000,
    });

    console.log("Uploading file as upload/" + remoteName);

    await sftp.put(buf, `upload/${remoteName}`);

    await sftp.end();

    return NextResponse.json({ ok: true, path: `uploads/${remoteName}` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
