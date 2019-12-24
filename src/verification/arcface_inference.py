#!usr/bin/env python3
# -*- coding:utf-8 _*-
'''
Copyright 2018 Soyoung All Rights Reserved.
@author:zqj
@file: openface_inference
@time: 7/18/19  3:07 PM
'''
import os
import sys
import numpy as np
import time
import warnings
from sklearn import preprocessing
warnings.filterwarnings("ignore")

import tensorflow as tf


class arcface:
    def __init__(self):
        os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
        with tf.Graph().as_default():
            output_graph_def = tf.GraphDef()
            with open("model/verification/arcface.pb", "rb") as f:
                output_graph_def.ParseFromString(f.read())
                _ = tf.import_graph_def(output_graph_def, name="")
            self.sess = tf.Session()
            self.input_x = self.sess.graph.get_tensor_by_name("Placeholder:0")
            self.emb = self.sess.graph.get_tensor_by_name("resnet_v1_50/E_BN2/Identity:0")

    def predict(self, scaled):
        res = self.sess.run(self.emb, feed_dict={self.input_x: scaled})
        return res


arcface_c = arcface()


def verification_inference(data):
    emb = arcface_c.predict(data)
    emb = preprocessing.normalize(emb)
    emb = np.reshape(emb, (2, 2, 512))
    emb = np.mean(emb, axis=0)
    dist = float(np.sqrt(np.sum(np.square(emb[0] - emb[1]))))
    return dist < 1.08, dist


if __name__ == '__main__':
    pass
