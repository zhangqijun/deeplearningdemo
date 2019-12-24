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
warnings.filterwarnings("ignore")
import tensorflow as tf


class ap:
    def __init__(self):
        os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
        with tf.Graph().as_default():
            output_graph_def = tf.GraphDef()
            with open("model/attribute_predict/app2.pb", "rb") as f:
                output_graph_def.ParseFromString(f.read())
                _ = tf.import_graph_def(output_graph_def, name="")
            self.sess = tf.Session()
            self.input_x = self.sess.graph.get_tensor_by_name("Placeholder:0")
            self.emb = self.sess.graph.get_tensor_by_name("Predict/BiasAdd:0")

    def predict(self,scaled):
        res = self.sess.run(self.emb, feed_dict={self.input_x: scaled})
        return res

ap_c = ap()
def ap_inference(img):
    return ap_c.predict(img)

if __name__ == '__main__':
    pass
