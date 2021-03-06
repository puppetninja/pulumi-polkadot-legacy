import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

// Create VPC for k8s nodes.
// As this is the first vpc created in AMS region and becomes the
// defuelt one, and it can't be deleted, same with terraform, it is
// pure DO API design problem:
// https://github.com/digitalocean/terraform-provider-digitalocean/issues/472
const vpcName = "midl-polkadot-vpc";
const vpcArgs: digitalocean.VpcArgs = {
    region: digitalocean.Region.AMS3,
};

const vpc = new digitalocean.Vpc(vpcName, vpcArgs);

// Create K8S nodepool
const clusterName = "polkadot-k8s";
const clusterConfig: digitalocean.KubernetesClusterArgs = {
    version: "1.20.7-do.0",
    region: digitalocean.Region.AMS3,
    nodePool: {
        name: "polkadot-k8s-pool",
        size: "s-1vcpu-2gb",
        nodeCount: 3,
    },
}
const cluster = new digitalocean.KubernetesCluster(clusterName, clusterConfig);

// Create K8S LB
const lbName = "midl-polkadot-lb";
const lbArgs: digitalocean.LoadBalancerArgs = {
    region: digitalocean.Region.AMS3,
    forwardingRules: [{
        entryPort: 30333,
        entryProtocol: "tcp",
        targetPort: 30333,
        targetProtocol: "tcp",
    },
    {
        entryPort: 30334,
        entryProtocol: "tcp",
        targetPort: 30334,
        targetProtocol: "tcp",
    }]
}
const lb = new digitalocean.LoadBalancer(lbName, lbArgs);

export const vpcname = vpc.name;
