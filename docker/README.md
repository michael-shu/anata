To build image:
docker build -t my-sftp-server .

To run:
docker run -d --name my_sftp_container -p 2222:22 -v 
>> "C:\Users\Michael\uploads:/home/sftpuser/sftp/upload" //This just mounts the upload folder in the container to whatever folder you want on your local machine.  
>> my-sftp-server:latest

