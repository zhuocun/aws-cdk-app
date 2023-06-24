import { Construct } from "constructs";
import {
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as el_bv2,
  aws_elasticloadbalancingv2_targets as targets,
} from "aws-cdk-lib";

export class JenkinsInfrastructure extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create a new VPC
    const vpc = new ec2.Vpc(this, "JenkinsVPC");

    // Create a security group for the Jenkins server
    const securityGroup = new ec2.SecurityGroup(this, "JenkinsSecurityGroup", {
      vpc,
      description: "Allow ssh access to jenkins server",
      allowAllOutbound: true,
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
    const jenkinsServer = new ec2.Instance(this, "JenkinsServer", {
      vpc,
      instanceType: new ec2.InstanceType("t2.medium"),
      machineImage: new ec2.AmazonLinuxImage(),
      securityGroup,
    });

    // use userData to install Jenkins
    jenkinsServer.userData.addCommands(
      "sudo yum update -y",
      "sudo yum install -y java-1.8.0-openjdk",
      "sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat/jenkins.repo",
      "sudo rpm --import https://pkg.jenkins.io/redhat/jenkins.io.key",
      "sudo yum install jenkins -y",
      "sudo systemctl start jenkins",
      "sudo systemctl enable jenkins"
    );

    // Create a load balancer
    const loadBalancer = new el_bv2.ApplicationLoadBalancer(
      this,
      "JenkinsLoadBalancer",
      {
        vpc,
        internetFacing: true,
      }
    );

    const listener = loadBalancer.addListener("Listener", {
      port: 8080,
    });

    const targetGroup = new el_bv2.ApplicationTargetGroup(this, "TargetGroup", {
      vpc,
      targets: [new targets.InstanceTarget(jenkinsServer)],
      port: 8080, // Specify port
      protocol: el_bv2.ApplicationProtocol.HTTP, // Specify protocol
    });

    listener.addAction("JenkinsAction", {
      action: el_bv2.ListenerAction.forward([targetGroup]),
    });
  }
}
