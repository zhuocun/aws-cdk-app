## Readme

This readme file provides instructions for accessing a remote EC2 instance and retrieving the initial admin password for Jenkins.

### Accessing the EC2 Instance

1. Set the correct permissions for the EC2 key pair file:

```shell
chmod 400 /Users/zhuocun/Library/CloudStorage/OneDrive-Personal/Downloads/zhuocun-ec2-key-name.pem
```

2. Connect to the EC2 instance using SSH:

```shell
ssh -i /Users/zhuocun/Library/CloudStorage/OneDrive-Personal/Downloads/zhuocun-ec2-key-name.pem ec2-user@ec2-3-26-226-138.ap-southeast-2.compute.amazonaws.com
```

Make sure to replace `/Users/zhuocun/Library/CloudStorage/OneDrive-Personal/Downloads/zhuocun-ec2-key-name.pem` with the correct path to your EC2 key pair file.

### Retrieving the Jenkins Initial Admin Password

To retrieve the initial admin password for Jenkins, follow these steps:

1. Check the status of the Jenkins service:

```shell
sudo systemctl status jenkins
```

2. Retrieve the initial admin password:

```shell
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

The command above will display the initial admin password on the terminal. Copy and save this password for future use.