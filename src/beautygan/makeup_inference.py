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


class beautygan:
    def __init__(self):
        os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
        with tf.Graph().as_default():
            output_graph_def = tf.GraphDef()
            with open("model/beautygan/makeup_frozen.pb", "rb") as f:
                output_graph_def.ParseFromString(f.read())
                _ = tf.import_graph_def(output_graph_def, name="")
            self.sess = tf.Session()
            self.X = self.sess.graph.get_tensor_by_name('X:0')
            self.Y = self.sess.graph.get_tensor_by_name('Y:0')
            self.Xs = self.sess.graph.get_tensor_by_name('generator/xs:0')

    def predict(self,X_img,Y_img):
        X_img=(X_img / 255. - 0.5) * 2
        Y_img=(Y_img / 255. - 0.5) * 2
        res = self.sess.run(self.Xs, feed_dict={self.X: [X_img], self.Y: [Y_img]})
        res = (res + 1) / 2
        return res

beautygan_c = beautygan()
def beautygan_inference(X_img,Y_img):
    return beautygan_c.predict(X_img,Y_img)

if __name__ == '__main__':
    pass
