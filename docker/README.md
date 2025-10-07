To build image:
docker build -t my-sftp-server .

To run:
docker run -d --name my_sftp_container -p 2222:22 -v 
>> "C:\Users\Michael\uploads:/home/sftpuser/sftp/upload" //Mounts upload folder in container to folder on local machine. Change as wanted. 
>> my-sftp-server:latest

