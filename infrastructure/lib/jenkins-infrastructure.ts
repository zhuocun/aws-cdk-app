import { Construct } from "constructs";
import {
    aws_ec2 as ec2,
    aws_elasticloadbalancingv2 as el_bv2,
    aws_elasticloadbalancingv2_targets as targets
} from "aws-cdk-lib";

const jenkinsInstallationScript: string[] = [
    // clean yum cache and update packages
    "sudo yum clean all",
    "sudo yum update -y",
    // Install Java
    "sudo amazon-linux-extras install java-openjdk11 -y",
    // Install Jenkins
    "sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat/jenkins.repo",
    "sudo rpm --import https://pkg.jenkins.io/redhat/jenkins.io-2023.key",
    "sudo yum install jenkins -y",
    // check if Jenkins installation was successful
    "if [[ $? -ne 0 ]]; then echo 'Jenkins installation failed'; exit 1; fi",
    // Start Jenkins
    "sudo systemctl start jenkins",
    "sudo systemctl enable jenkins",
    // check if Jenkins service started successfully
    "if [[ $(systemctl is-active jenkins) != 'active' ]]; then echo 'Jenkins service did not start properly'; exit 1; fi"
];

class JenkinsInfrastructure extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create a new VPC
        const vpc = new ec2.Vpc(this, "JenkinsVPC");

        // Create a security group for the Jenkins server
        const securityGroup = new ec2.SecurityGroup(this, "JenkinsSecurityGroup", {
            vpc,
            description: "Allow ssh access to jenkins server",
            // allow all outbound traffic by default (for Jenkins to be able to download plugins and updates)
            allowAllOutbound: true
        });

        securityGroup.addIngressRule(
          ec2.Peer.anyIpv4(), // NOSONAR
          // ssh uses port 22 by default
          ec2.Port.tcp(22),
          "allow ssh access from the world"
        );

        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            // Jenkins uses port 8080 by default
            ec2.Port.tcp(8080),
            "allow jenkins web access from the world"
        );

        // Create the Jenkins server
        // Use Amazon Linux 2
        const jenkinsInstance = new ec2.Instance(this, "JenkinsInstance", {
            vpc,
            instanceType: new ec2.InstanceType("t2.medium"),
            machineImage: ec2.MachineImage.latestAmazonLinux2(),
            securityGroup,
            keyName: "zhuocun-ec2-key-name",
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            associatePublicIpAddress: true
        });

        // use userData to install Jenkins
        jenkinsInstance.userData.addCommands(...jenkinsInstallationScript);

        // Create a load balancer
        const loadBalancer = new el_bv2.ApplicationLoadBalancer(
            this,
            "JenkinsLoadBalancer",
            {
                vpc,
                internetFacing: true
            }
        );

        // the load balancer uses listener to forward requests to the target group
        // this listener listens on port 8080
        const listener = loadBalancer.addListener("Listener", {
            port: 8080
        });

        // Create a target group
        const targetGroup = new el_bv2.ApplicationTargetGroup(this, "TargetGroup", {
            vpc,
            targets: [new targets.InstanceTarget(jenkinsInstance)],
            // a target group listens on a port to forward requests to the targets
            port: 8080,
            protocol: el_bv2.ApplicationProtocol.HTTP
        });

        listener.addAction("JenkinsAction", {
            // [listener] -> [targetGroup] -> [jenkinsInstance]
            action: el_bv2.ListenerAction.forward([targetGroup])
        });
    }
}

export { JenkinsInfrastructure };
