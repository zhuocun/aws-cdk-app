import { Construct } from "constructs";
import {
    aws_ec2 as ec2,
    aws_elasticloadbalancingv2 as el_bv2,
    aws_elasticloadbalancingv2_targets as targets
} from "aws-cdk-lib";

const jenkinsInstallationScript: string[] = [
    "sudo yum clean all",
    "sudo yum update -y",
    "sudo amazon-linux-extras install java-openjdk11 -y",
    "sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat/jenkins.repo",
    "sudo rpm --import https://pkg.jenkins.io/redhat/jenkins.io-2023.key",
    "sudo yum install jenkins -y",
    "if [[ $? -ne 0 ]]; then echo 'Jenkins installation failed'; exit 1; fi",
    "sudo systemctl start jenkins",
    "sudo systemctl enable jenkins",
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
            allowAllOutbound: true
        });

        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            "allow ssh access from the world"
        );

        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
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

        const listener = loadBalancer.addListener("Listener", {
            port: 8080
        });

        const targetGroup = new el_bv2.ApplicationTargetGroup(this, "TargetGroup", {
            vpc,
            targets: [new targets.InstanceTarget(jenkinsInstance)],
            port: 8080, // Specify port
            protocol: el_bv2.ApplicationProtocol.HTTP // Specify protocol
        });

        listener.addAction("JenkinsAction", {
            action: el_bv2.ListenerAction.forward([targetGroup])
        });
    }
}

export { JenkinsInfrastructure };
